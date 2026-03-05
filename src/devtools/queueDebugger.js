/**
 * PPLGBot - DevTools: Queue Debugger
 * Membantu mendebug masalah queue dan player
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

/**
 * Queue Debugger
 * Memantau dan mendebug queue state
 */
class QueueDebugger {
  constructor(client) {
    this.client = client;
    this.debugLogs = [];
  }

  /**
   * Get detailed queue info
   */
  getQueueInfo(guildId) {
    const player = this.client.riffy.players.get(guildId);
    
    if (!player) {
      return {
        exists: false,
        guildId,
        message: "Player tidak ada untuk guild ini"
      };
    }

    // Get queue as array safely
    let queueArray = [];
    try {
      if (player.queue) {
        queueArray = Array.from(player.queue);
      }
    } catch (e) {
      console.error("[QueueDebugger] Error getting queue:", e);
    }

    const info = {
      exists: true,
      guildId,
      connectionState: player.connection?.state || "unknown",
      playing: player.playing,
      paused: player.paused,
      position: player.position,
      queueSize: queueArray.length,
      currentTrack: player.current ? {
        title: player.current.info?.title || "Unknown",
        author: player.current.info?.author || "Unknown",
        uri: player.current.info?.uri || "N/A",
        duration: player.current.info?.length || 0,
        thumbnail: player.current.info?.thumbnail || "N/A"
      } : null,
      volume: player.volume,
      loop: player.loop,
      autoplay: player.autoplay,
      queue: queueArray.slice(0, 10).map((track, index) => ({
        index: index + 1,
        title: track.info?.title || "Unknown",
        author: track.info?.author || "Unknown",
        uri: track.info?.uri || "N/A",
        duration: track.info?.length || 0
      }))
    };

    this.log(`Queue info for ${guildId}: ${queueArray.length} tracks`);
    return info;
  }

  /**
   * Get all active players
   */
  getAllPlayers() {
    const players = [];
    
    for (const [guildId, player] of this.client.riffy.players) {
      let queueArray = [];
      try {
        if (player.queue) {
          queueArray = Array.from(player.queue);
        }
      } catch (e) {
        queueArray = [];
      }

      players.push({
        guildId,
        guildName: this.client.guilds.cache.get(guildId)?.name || "Unknown",
        playing: player.playing,
        paused: player.paused,
        queueSize: queueArray.length,
        currentTrack: player.current?.info?.title || "None",
        volume: player.volume,
        loop: player.loop
      });
    }

    return players;
  }

  /**
   * Validate queue state
   */
  validateQueue(guildId) {
    const player = this.client.riffy.players.get(guildId);
    const issues = [];
    const warnings = [];

    if (!player) {
      issues.push("Player tidak ditemukan");
      return { valid: false, issues, warnings };
    }

    // Check queue
    try {
      if (player.queue) {
        const queueArray = Array.from(player.queue);
        
        if (queueArray.length > 1000) {
          warnings.push(`Queue sangat besar: ${queueArray.length} tracks`);
        }

        // Check for invalid tracks
        for (let i = 0; i < queueArray.length; i++) {
          const track = queueArray[i];
          if (!track || !track.info) {
            issues.push(`Track invalid pada index ${i}`);
          }
        }
      }
    } catch (e) {
      issues.push(`Error saat mengakses queue: ${e.message}`);
    }

    // Check player state
    if (player.volume < 0 || player.volume > 200) {
      warnings.push(`Volume tidak normal: ${player.volume}`);
    }

    if (player.position < 0) {
      warnings.push(`Position negatif: ${player.position}`);
    }

    const valid = issues.length === 0;
    return { valid, issues, warnings };
  }

  /**
   * Force fix queue issues
   */
  async fixQueue(guildId) {
    const player = this.client.riffy.players.get(guildId);
    
    if (!player) {
      return { success: false, error: "Player tidak ditemukan" };
    }

    try {
      // Validate and clean queue
      if (player.queue) {
        const queueArray = Array.from(player.queue);
        const validTracks = queueArray.filter(t => t && t.info);
        
        // Clear and re-add valid tracks
        while (player.queue.length > 0) {
          player.queue.shift();
        }
        
        for (const track of validTracks) {
          player.queue.add(track);
        }
      }

      this.log(`Fixed queue for guild ${guildId}`);
      return { success: true, message: "Queue diperbaiki" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Log debug message
   */
  log(message) {
    const timestamp = new Date().toISOString();
    this.debugLogs.push({ timestamp, message });
    
    // Keep only last 100 logs
    if (this.debugLogs.length > 100) {
      this.debugLogs.shift();
    }
    
    console.log(`[QueueDebugger] ${message}`);
  }

  /**
   * Get debug logs
   */
  getLogs() {
    return this.debugLogs;
  }

  /**
   * Clear debug logs
   */
  clearLogs() {
    this.debugLogs = [];
  }
}

module.exports = QueueDebugger;

