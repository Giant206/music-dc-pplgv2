/**
 * PPLGBot - Event: Guild Create
 * Menghandle ketika bot join ke server baru
 */

const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

module.exports = (client) => {
  client.on("guildCreate", async (guild) => {
    try {
      // Find a suitable channel to send the welcome message
      let welcomeChannel = null;

      // Try to find a text channel with proper permissions
      const textChannels = guild.channels.cache
        .filter(channel => 
          channel.type === ChannelType.GuildText && 
          channel.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)
        )
        .sort((a, b) => a.position - b.position);

      // Prefer the system channel or first available channel
      welcomeChannel = guild.systemChannelId ? textChannels.get(guild.systemChannelId) : textChannels.first();

      if (!welcomeChannel) {
        console.log(`[GUILD] Cannot find suitable channel in ${guild.name}`);
        return;
      }

      // Create attractive welcome embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x6C5CE7)
        .setTitle("🎶 Selamat Datang di PPLG Bot Music!")
        .setDescription(
          `Hai **${guild.name}**! 👋\n\n` +
          `Terima kasih sudah mengundang saya ke server ini! 🎉\n\n` +
          `**PPLG Bot Music** adalah bot musik modern dengan fitur lengkap:\n\n` +
          `🎵 **Fitur Utama:**\n` +
          `• Putar musik dari berbagai sumber (YouTube, Spotify, SoundCloud, dll)\n` +
          `• Anti-disconnect dengan mode 24/7\n` +
          `• Sistem antrian canggih dengan shuffle, loop, dan filter\n` +
          `• Auto-play untuk putar musik terus menerus\n` +
          `• Dan masih banyak lagi!\n\n` +
          `💡 **Cara Menggunakan:**\n` +
          `Ketik \`/play\` untuk memutar lagu\n` +
          `Ketik \`/help\` untuk melihat semua perintah\n\n` +
          `⚠️ **Catatan:** Jangan spam command ya!`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ 
          text: `PPLG Bot Music • Server: ${guild.name}`, 
          iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

      // Create action buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("welcome_help")
            .setLabel("📚 Lihat Help")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("welcome_invite")
            .setLabel("🔗 Invite Link")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"),
          new ButtonBuilder()
            .setCustomId("welcome_support")
            .setLabel("💬 Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/your-support-server")
        );

      // Send welcome message
      await welcomeChannel.send({
        embeds: [welcomeEmbed],
        components: [buttons]
      });

      console.log(`[GUILD] Sent welcome message to ${guild.name}`);

    } catch (error) {
      console.error(`[GUILD] Error sending welcome message to ${guild.name}:`, error.message);
    }
  });
};

/**
 * PPLGBot - Guild Create Event
 * Welcome message when bot joins a new server
 */

