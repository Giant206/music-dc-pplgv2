/**
 * PPLGBot - DevTools: Lavalink Monitor
 * Memantau koneksi dan performa Lavalink node
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

/**
 * Lavalink Monitor
 * Memantau status dan performa Lavalink nodes
 */
class LavalinkMonitor {
  constructor(client) {
    this.client = client;
    this.pingHistory = [];
    this.alerts = [];
    this.startTime = Date.now();
  }

  /**
   * Get all nodes info
   */
  getNodesInfo() {
    if (!this.client.riffy || !this.client.riffy.nodes) {
      return { error: "Riffy client tidak tersedia" };
    }

    const nodes = [];
    
    for (const [name, node] of this.client.riffy.nodes) {
      const stats = node.stats || {};
      
      nodes.push({
        name: name,
        identifier: node.options?.identifier || name,
        connected: node.isConnected,
        ping: node.ping || 0,
        penalty: node.penalty || 0,
        stats: {
          players: stats.players || 0,
          playingPlayers: stats.playingPlayers || 0,
          uptime: stats.uptime || 0,
          memory: {
            used: stats.memory?.used || 0,
            free: stats.memory?.free || 0,
            allocated: stats.memory?.allocated || 0
          },
          cpu: {
            cores: stats.cpu?.cores || 0,
            systemLoad: stats.cpu?.systemLoad || 0,
            lavalinkLoad: stats.cpu?.lavalinkLoad || 0
          }
        }
      });
    }

    return nodes;
  }

  /**
   * Get node health status
   */
  getNodeHealth(nodeName) {
    const nodes = this.getNodesInfo();
    
    if (Array.isArray(nodes)) {
      const node = nodes.find(n => n.name === nodeName);
      if (!node) return { status: "not_found" };
      
      let health = "healthy";
      const issues = [];
      
      if (!node.connected) {
        health = "offline";
        issues.push("Node tidak terhubung");
      } else if (node.ping > 200) {
        health = "degraded";
        issues.push(`Ping tinggi: ${node.ping}ms`);
      } else if (node.penalty > 10) {
        health = "degraded";
        issues.push(`Penalty tinggi: ${node.penalty}`);
      } else if ((stats.memory?.used / stats.memory?.allocated) > 0.9) {
        health = "degraded";
        issues.push("Memory hampir penuh");
      }
      
      return { status: health, issues, ...node };
    }
    
    return { status: "error", error: nodes.error };
  }

  /**
   * Record ping
   */
  recordPing(nodeName, ping) {
    this.pingHistory.push({
      node: nodeName,
      ping,
      timestamp: Date.now()
    });
    
    // Keep last 100 pings
    if (this.pingHistory.length > 100) {
      this.pingHistory.shift();
    }
    
    // Alert if ping too high
    if (ping > 300) {
      this.alerts.push({
        type: "high_ping",
        node: nodeName,
        ping,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get ping statistics
   */
  getPingStats(nodeName) {
    const nodePings = this.pingHistory.filter(p => p.node === nodeName);
    
    if (nodePings.length === 0) {
      return { error: "Belum ada data ping" };
    }
    
    const pings = nodePings.map(p => p.ping);
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    const min = Math.min(...pings);
    const max = Math.max(...pings);
    
    return {
      node: nodeName,
      count: pings.length,
      avg: avg.toFixed(2),
      min,
      max,
      history: nodePings.slice(-10)
    };
  }

  /**
   * Get alerts
   */
  getAlerts() {
    return this.alerts;
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = [];
  }

  /**
   * Check all nodes and return status
   */
  checkAllNodes() {
    const nodes = this.getNodesInfo();
    
    if (!Array.isArray(nodes)) {
      return { error: nodes.error };
    }
    
    const status = {
      total: nodes.length,
      online: nodes.filter(n => n.connected).length,
      offline: nodes.filter(n => !n.connected).length,
      nodes: nodes.map(n => ({
        name: n.name,
        connected: n.connected,
        ping: n.ping,
        players: n.stats.players,
        playingPlayers: n.stats.playingPlayers
      }))
    };
    
    return status;
  }

  /**
   * Get monitor uptime
   */
  getUptime() {
    return {
      startTime: this.startTime,
      uptime: Date.now() - this.startTime,
      pingsRecorded: this.pingHistory.length,
      alertsCount: this.alerts.length
    };
  }

  /**
   * Create status embed
   */
  createStatusEmbed() {
    const nodes = this.getNodesInfo();
    
    if (!Array.isArray(nodes)) {
      return new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Error\nTidak dapat mengambil info node")
        );
    }

    const status = this.checkAllNodes();
    const uptime = this.getUptime();
    
    let nodesText = nodes.map(n => {
      const statusEmoji = n.connected ? "🟢" : "🔴";
      return `${statusEmoji} **${n.name}**\n` +
        `   Ping: ${n.ping}ms | Players: ${n.stats.playingPlayers}/${n.stats.players}`;
    }).join("\n\n");

    return new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 📡 Lavalink Monitor")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### 📊 Status Overview\n` +
          `Nodes: ${status.online}/${status.total} online\n` +
          `Uptime: ${Math.floor(uptime.uptime / 1000 / 60)} menit\n` +
          `Total Alerts: ${uptime.alertsCount}\n\n` +
          `### 🖥️ Nodes\n${nodesText}`
        )
      );
  }
}

module.exports = LavalinkMonitor;

