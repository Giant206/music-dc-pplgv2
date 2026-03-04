/**
 * PPLGBot - Command: Ping
 * Menampilkan status bot dengan statistik premium
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

module.exports = {
  name: "ping",
  description: "Menampilkan status dan statistik bot",

  run: async (client, interaction) => {
    const ping = client.ws.ping;
    const uptime = process.uptime();
    
    // Format uptime
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const ramUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const ramTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    // Create container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 📊 Status PPLGBot")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "**📡 Koneksi:**\n" +
          `• Gateway Ping: \`${ping}ms\`\n` +
          `• API Latency: \`${Date.now() - interaction.createdTimestamp}ms\`\n\n` +
          
          "**⏰ Waktu Aktif:**\n" +
          `• ${hours} jam ${minutes} menit ${seconds} detik\n\n` +
          
          "**💾 Memori:**\n" +
          `• RAM: ${ramUsed}MB / ${ramTotal}MB\n\n` +
          
          "**⚙️ Sistem:**\n" +
          `• Node.js: \`${process.version}\`\n` +
          `• Discord.js: \`v14.21.0\``
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setURL("https://discord.gg/")
          .setLabel("Support Server")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setCustomId("ping_refresh")
          .setLabel("Refresh")
          .setEmoji("🔄")
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({
      components: [container, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

