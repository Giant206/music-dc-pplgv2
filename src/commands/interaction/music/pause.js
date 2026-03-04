/**
 * PPLGBot - Command: Pause
 * Menjeda lagu yang sedang diputar
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
  name: "pause",
  description: "Jeda lagu yang sedang diputar",
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
    // ⏸️ ALREADY PAUSED
    // ============================================
    if (player.paused) {
      const alreadyPaused = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⏸️ Sudah Dijeda")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Player sudah dalam keadaan dijeda."
          )
        );

      return interaction.reply({
        components: [alreadyPaused],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Pause the player
    player.pause(true);

    // Create success embed
    const paused = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ⏸️ Musik Dijeda")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${player.current.info.title}** telah dijeda.\n\n` +
          `Gunakan /resume untuk melanjutkan.`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`music_resume_${interaction.guild.id}`)
          .setLabel("Resume")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`music_stop_${interaction.guild.id}`)
          .setLabel("Stop")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Danger)
      );

    return interaction.reply({
      components: [paused, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

