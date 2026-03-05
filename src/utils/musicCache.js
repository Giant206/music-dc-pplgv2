/**
 * PPLGBot - Music Cache System
 * Cache lagu yang sering diputar untuk mengurangi request ke Lavalink
 */

class MusicCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 3600000; // 1 hour default
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key from track info
   */
  generateKey(query, source = "youtube") {
    return `${source}:${query.toLowerCase().trim()}`;
  }

  /**
   * Get cached track
   */
  get(query, source = "youtube") {
    const key = this.generateKey(query, source);
    const cached = this.cache.get(key);

    if (!cached) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update timestamp for LRU
    cached.timestamp = Date.now();
    cached.hits = (cached.hits || 0) + 1;
    this.hits++;

    return cached.track;
  }

  /**
   * Set cached track
   */
  set(query, source, track) {
    // Check memory usage and clear if needed
    this.checkMemory();

    const key = this.generateKey(query, source);
    this.cache.set(key, {
      track,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Check memory and clear old entries if needed
   */
  checkMemory() {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries (first 10%)
      const entriesToRemove = Math.floor(this.maxSize * 0.1);
      const entries = Array.from(this.cache.entries());
      
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest
      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Clear cache if RAM is high
   */
  clearIfHighMemory(threshold = 90) {
    const os = require("os");
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

    if (usedPercent > threshold) {
      this.clear();
      console.log(`[MusicCache] Cleared due to high memory usage (${usedPercent.toFixed(1)}%)`);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache stats
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate + "%",
      ttl: this.ttl
    };
  }

  /**
   * Get most played tracks
   */
  getTopTracks(limit = 10) {
    const tracks = Array.from(this.cache.values())
      .sort((a, b) => (b.hits || 0) - (a.hits || 0))
      .slice(0, limit);
    
    return tracks.map(t => ({
      track: t.track,
      hits: t.hits || 0
    }));
  }

  /**
   * Preload popular tracks
   */
  async preload(client, tracks) {
    for (const track of tracks) {
      try {
        const resolve = await client.riffy.resolve({
          query: track.query,
          source: track.source || "youtube"
        });

        if (resolve && resolve.tracks && resolve.tracks.length > 0) {
          this.set(track.query, track.source || "youtube", resolve.tracks[0]);
        }
      } catch (e) {
        // Ignore preload errors
      }
    }
  }
}

// Export singleton instance
module.exports = new MusicCache({
  maxSize: 100,
  ttl: 3600000 // 1 hour
});

module.exports.MusicCache = MusicCache;

