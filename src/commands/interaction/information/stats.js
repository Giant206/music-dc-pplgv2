/**
 * PPLGBot - Command: Stats
 * Menampilkan statistik bot secara global
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const os = require("os");
const db = require("../../../database/profile");

module.exports = {
  name: "stats",
  description: "Menampilkan statistik bot",

  run: async (client, interaction) => {
    // Defer reply
    await interaction.deferReply();

    try {
      // Get global stats from database
      const globalStats = await db.getStats();
      
      // Get MongoDB connection status
      const mongoConnected = db.isMongoConnected();

      // Get Lavalink nodes info
      const nodes = Array.from(client.riffy.nodes.values());
      const connectedNodes = nodes.filter(n => n.isConnected);
      
      // Get player count
      const playerCount = client.riffy.players.size;
      const playingPlayers = Array.from(client.riffy.players.values()).filter(p => p.playing).length;

      // System stats
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryPercent = ((usedMemory / totalMemory) * 100).toFixed(1);
      
      const cpuCount = os.cpus().length;
      const cpuLoad = os.loadavg()[0].toFixed(2);
      
      const uptime = process.uptime();
      const formattedUptime = db.formatListeningTime(Math.floor(uptime));

      // Format listening time
      const formattedListeningTime = db.formatListeningTime(globalStats?.totalListening || 0);

      // Create main stats container
      const statsContainer = new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 📊 Statistik PPLGBot")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### 🤖 Informasi Bot\n` +
            `**Servers:** ${client.guilds.cache.size}\n` +
            `**Users:** ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString()}\n` +
            `**Channels:** ${client.channels.cache.size}\n` +
            `**Uptime:** ${formattedUptime}\n\n` +
            
            `### 🎵 Musik\n` +
            `**Players Aktif:** ${playerCount}\n` +
            `**Sedang Diputar:** ${playingPlayers}\n` +
            `**Total Lagu Diputar:** ${globalStats?.totalTracksPlayed || 0}\n` +
            `**Total Mendengarkan:** ${formattedListeningTime}\n\n` +
            
            `### 💻 Sistem\n` +
            `**CPU Cores:** ${cpuCount}\n` +
            `**CPU Load:** ${cpuLoad}\n` +
            `**Memory:** ${(usedMemory / 1024 / 1024 / 1024).toFixed(1)}GB / ${(totalMemory / 1024 / 1024 / 1024).toFixed(1)}GB (${memoryPercent}%)\n` +
            `**Platform:** ${os.platform()}\n\n` +
            
            `### 🔗 Koneksi\n` +
            `**Discord WS:** ${client.ws.ping}ms\n` +
            `**Lavalink Nodes:** ${connectedNodes.length}/${nodes.length} online\n` +
            `**MongoDB:** ${mongoConnected ? "✅ Terhubung" : "❌ Terputus"}`
          )
        );

      // Create nodes info if available
      if (nodes.length > 0) {
        statsContainer.addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        );
        
        const nodesInfo = nodes.map(node => {
          const status = node.isConnected ? "🟢 Online" : "🔴 Offline";
          const ping = node.ping ? `${node.ping}ms` : "N/A";
          const players = node.stats?.players || 0;
          const playing = node.stats?.playingPlayers || 0;
          return `**${node.name}:** ${status} | Ping: ${ping} | Players: ${players} (${playing} playing)`;
        }).join("\n");
        
        statsContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`### 🖥️ Node Status\n${nodesInfo}`)
        );
      }

      // Add top tracks if available
      if (globalStats?.topTracks && globalStats.topTracks.length > 0) {
        statsContainer.addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        );
        
        const topTracksText = globalStats.topTracks.slice(0, 5)
          .map((t, i) => `${i + 1}. **${t.title}** - ${t.artist} (${t.plays} plays)`)
          .join("\n");
        
        statsContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`### 🔥 Top Lagu\n${topTracksText}`)
        );
      }

      // Add top artists if available
      if (globalStats?.topArtists && globalStats.topArtists.length > 0) {
        statsContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `\n### 🎤 Top Artist\n` +
            globalStats.topArtists.slice(0, 5)
              .map((a, i) => `${i + 1}. **${a.name}** (${a.plays} plays)`)
              .join("\n")
          )
        );
      }

      // Create buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`stats_refresh_${interaction.user.id}`)
            .setLabel("🔄 Segar")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`stats_nodes_${interaction.user.id}`)
            .setLabel("📡 Nodes")
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({
        components: [statsContainer, buttons],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (error) {
      console.error("[Stats] Error:", error);
      
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Error")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Gagal mengambil statistik:\n\`\`\`js\n${error.message}\n\`\`\``
          )
        );

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }
  }
};

/**
 * PPLGBot - Bot Statistics System
 * Menampilkan statistik global bot termasuk memory, CPU, players, dll
 */

