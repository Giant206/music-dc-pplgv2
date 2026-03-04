/**
 * PPLGBot - Command: Resume
 * Melanjutkan lagu yang dijeda
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
  name: "resume",
  description: "Melanjutkan lagu yang dijeda",
  inVoice: true,
  sameVoice: true,
  player: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player || !player.current) {
      const noTrack = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Tidak Ada Musik")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Tidak ada lagu yang sedang diputar."
          )
        );

      return interaction.reply({
        components: [noTrack],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // ============================================
    // ▶️ ALREADY PLAYING
    // ============================================
    if (!player.paused) {
      const alreadyPlaying = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ▶️ Sudah Diputar")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Player sudah dalam keadaan diputar."
          )
        );

      return interaction.reply({
        components: [alreadyPlaying],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Resume the player
    player.pause(false);

    // Create success embed
    const resumed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ▶️ Musik Dilanjutkan")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${player.current.info.title}** telah dilanjutkan.`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`music_pause_${interaction.guild.id}`)
          .setLabel("Pause")
          .setEmoji("⏸️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_stop_${interaction.guild.id}`)
          .setLabel("Stop")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Danger)
      );

    return interaction.reply({
      components: [resumed, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

