/**
 * PPLGBot - Command: Autoplay
 * Mengaktifkan/menonaktifkan pemutaran otomatis
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
  name: "autoplay",
  description: "Aktifkan pemutaran otomatis",
  inVoice: true,
  sameVoice: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player) {
      const noPlayer = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Player Tidak Ditemukan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Tidak ada player musik aktif untuk server ini."
          )
        );

      return interaction.reply({
        components: [noPlayer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Toggle autoplay
    player.isAutoplay = !player.isAutoplay;

    // Try to call autoplay function if enabled (riffy v3+)
    if (player.isAutoplay && typeof player.autoplay === "function") {
      try {
        player.autoplay(player);
      } catch (e) {
        console.log("[Autoplay] autoplay() not available in this version");
      }
    }

    // Create embed
    const updated = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔄 Autoplay Diperbarui")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Mode autoplay sekarang: **${player.isAutoplay ? "AKTIF" : "NONAKTIF"}**\n\n` +
          `${player.isAutoplay ? "Bot akan otomatis memutar lagu serupa setelah lagu habis." : "Bot tidak akan memutar lagu otomatis."}`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`autoplay_toggle_${interaction.guild.id}`)
          .setLabel(player.isAutoplay ? "Nonaktifkan" : "Aktifkan")
          .setEmoji(player.isAutoplay ? "⏸️" : "▶️")
          .setStyle(player.isAutoplay ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`music_queue_${interaction.guild.id}`)
          .setLabel("Lihat Antrian")
          .setEmoji("📋")
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({
      components: [updated, buttons],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

