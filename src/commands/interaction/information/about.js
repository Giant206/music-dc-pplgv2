/**
 * PPLGBot - Command: About
 * Menampilkan informasi dan statistik premium tentang bot
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
  name: "about",
  description: "Informasi dan statistik tentang PPLGBot",

  run: async (client, interaction) => {
    // Get statistics
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const players = client.riffy?.players?.size || 0;
    const nodes = client.riffy
      ? Array.from(client.riffy.nodes.values()).filter(n => n.isConnected).length
      : 0;

    // Uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    // Create container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🎵 Tentang PPLGBot")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "**🤖 Bot Musik Discord Premium**\n" +
          "Ditenagai oleh Lavalink & Komponen Modern V2\n\n" +

          "**✨ Fitur:**\n" +
          "• Audio Berkualitas Tinggi: Pemutaran musik berkualitas tinggi dari berbagai platform streaming\n" +
          "• Pemutaran 24/7: Musik tidak akan berhenti dengan fitur pemutaran continue\n" +
          "• Antrian Lanjutan: Kontrol antrian lengkap termasuk acak, loop, dan hapus lagu\n" +
          "• Filter Cerdas: Terapkan filter seperti bass boost, nightcore, dan perubahan kecepatan\n" +
          "• Dukungan Playlist: Import dan putar playlist lengkap dari berbagai sumber\n" +
          "• Preset Equalizer: Pengaturan EQ yang sudah dikonfigurasi untuk berbagai genre musik\n" +
          "• Respons Cepat: Ditenagai oleh Lavalink untuk latensi minimal dan streaming halus\n" +
          "• Infrastruktur Terpercaya: Dibangun di atas Komponen V2 Discord untuk stabilitas-enhanced\n\n" +

          "**📊 Statistik:**\n" +
          `• Server: **${guilds}**\n` +
          `• Users: **${users}**\n` +
          `• Player Aktif: **${players}**\n` +
          `• Node Terhubung: **${nodes}**\n\n` +

          "**💻 Informasi Sistem:**\n" +
          `• Waktu Aktif: ${days}h ${hours}m ${minutes}m\n` +
          `• Ping: ${client.ws.ping}ms\n` +
          `• Node.js: ${process.version}\n` +
          `• Discord.js: v14\n\n` +

          "**🛠️ Pengembangan:**\n" +
          "Dibuat dengan ❤️ oleh Tim PPLGBot.\n" +
          "Untuk dukungan dan pembaruan, bergabung dengan server support kami."
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "Gunakan `/help` untuk melihat semua command yang tersedia."
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("about_invite")
          .setLabel("Invite Bot")
          .setEmoji("📨")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setURL("https://discord.gg/")
          .setLabel("Support Server")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setCustomId("about_vote")
          .setLabel("Vote")
          .setEmoji("🗳️")
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

