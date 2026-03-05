/**
 * PPLGBot - DevTools: Music Stress Test
 * Menguji stabilitas sistem musik dengan menambahkan banyak lagu ke queue
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

/**
 * Music Stress Test
 * Menambahkan banyak track ke queue untuk menguji stabilitas
 */
class MusicStressTest {
  constructor(client) {
    this.client = client;
    this.testResults = [];
  }

  /**
   * Run stress test dengan jumlah track tertentu
   */
  async run(guildId, trackCount = 100) {
    const player = this.client.riffy.players.get(guildId);
    
    if (!player) {
      return { success: false, error: "Player tidak ditemukan" };
    }

    const startTime = Date.now();
    const startQueueSize = player.queue.size;

    // Add tracks
    for (let i = 0; i < trackCount; i++) {
      const mockTrack = {
        info: {
          title: `Test Track ${i + 1}`,
          author: "Stress Test",
          uri: "https://example.com/test",
          length: 180000,
          isStream: false,
          isSeekable: true,
          thumbnail: ""
        },
        track: `mock_track_${i}`,
        requester: { id: "stress_test", username: "StressTest" }
      };
      
      player.queue.add(mockTrack);
    }

    const endTime = Date.now();
    const endQueueSize = player.queue.size;
    const duration = endTime - startTime;

    const result = {
      success: true,
      trackCount,
      queueBefore: startQueueSize,
      queueAfter: endQueueSize,
      duration: `${duration}ms`,
      avgPerTrack: `${(duration / trackCount).toFixed(2)}ms`
    };

    this.testResults.push(result);
    return result;
  }

  /**
   * Clear all tracks from queue
   */
  async clearQueue(guildId) {
    const player = this.client.riffy.players.get(guildId);
    
    if (!player) {
      return { success: false, error: "Player tidak ditemukan" };
    }

    const queueSize = player.queue.size;
    
    if (player.queue.clear) {
      player.queue.clear();
    } else {
      // Manual clear
      while (player.queue.length > 0) {
        player.queue.shift();
      }
    }

    return { success: true, clearedCount: queueSize };
  }

  /**
   * Get test results
   */
  getResults() {
    return this.testResults;
  }

  /**
   * Reset test results
   */
  resetResults() {
    this.testResults = [];
  }
}

module.exports = MusicStressTest;

