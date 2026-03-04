/**
 * PPLGBot - Command: 247 Mode
 * Aktifkan/nonaktifkan mode 24/7 bot stays di voice channel
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

const db = require("../../../database/profile");

module.exports = {
  name: "247",
  description: "Aktifkan/nonaktifkan mode 24/7 (bot tetap di voice channel)",
  inVoice: true,
  sameVoice: true,

  options: [
    {
      name: "mode",
      description: "Pilih mode on atau off",
      type: 3, // String
      required: false,
      choices: [
        { name: "On", value: "on" },
        { name: "Off", value: "off" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice?.channel;
    const mode = interaction.options?.getString("mode");
    
    // Get current 247 settings
    const currentSettings = db.get247Mode(guildId);
    
    // ============================================
    // ❌ CHECK VOICE CHANNEL
    // ============================================
    if (!voiceChannel && (mode === "on" || !currentSettings.enabled)) {
      const notInVC = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Tidak Ada Voice Channel")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Kamu harus berada di voice channel untuk mengaktifkan mode 247."
          )
        );

      return interaction.reply({
        components: [notInVC],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // ============================================
    // 🎛️ TOGGLE 247 MODE
    // ============================================
    
    // Determine mode (toggle if not specified)
    let newMode;
    if (mode === "on") {
      newMode = true;
    } else if (mode === "off") {
      newMode = false;
    } else {
      // Toggle current state
      newMode = !currentSettings.enabled;
    }

    if (newMode) {
      // Enable 247 mode
      const player = client.riffy.players.get(guildId);
      
      // Save 247 settings
      db.set247Mode(guildId, {
        enabled: true,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channel.id,
        volume: player?.volume || 100,
        autoplay: player?.isAutoplay || false,
        loop: player?.loop || "off"
      });

      const enabledEmbed = new ContainerBuilder()
        .setAccentColor(0x22c55e)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ✅ Mode 247 Aktif")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Mode 24/7 telah diaktifkan!**\n\n` +
            `Bot akan tetap stay di <#${voiceChannel.id}> meskipun tidak ada musik.\n\n` +
            `Untuk menonaktifkan, ketik: \`/247 mode: Off\``
          )
        );

      // Create buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("247_off")
            .setLabel("Matikan 247")
            .setEmoji("⏹️")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("247_status")
            .setLabel("Status")
            .setEmoji("📊")
            .setStyle(ButtonStyle.Secondary)
        );

      return interaction.reply({
        components: [enabledEmbed, buttons],
        flags: MessageFlags.IsComponentsV2
      });

    } else {
      // Disable 247 mode
      db.set247Mode(guildId, { enabled: false });

      const disabledEmbed = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⏹️ Mode 247 Nonaktif")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Mode 24/7 telah dinonaktifkan.\n" +
            "Bot akan leave voice channel jika antrian kosong."
          )
        );

      return interaction.reply({
        components: [disabledEmbed],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};

/**
 * PPLGBot - 247 Mode Command
 * Allows users to enable/disable 24/7 mode per server
 */

