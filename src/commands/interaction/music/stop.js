/**
 * PPLGBot - Command: Stop
 * Menghentikan musik dan memutuskan bot dari voice channel
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
  name: "stop",
  description: "Hentikan musik dan keluar dari voice channel",
  inVoice: true,
  sameVoice: true,
  player: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player) {
      const noPlayer = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Tidak Ada Player")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Tidak ada sesi musik yang aktif di server ini."
          )
        );

      return interaction.reply({
        components: [noPlayer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Store voice channel before destroying
    const voiceChannelId = player.voiceChannel;

    // Stop and destroy player
    player.destroy();

    // Create success embed
    const stopped = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ⏹️ Musik Dihentikan")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Pemutaran musik telah dihentikan dan bot keluar dari <#${voiceChannelId}>.`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`music_play_${interaction.guild.id}`)
          .setLabel("Putar Lagu")
          .setEmoji("🎵")
          .setStyle(ButtonStyle.Primary)
      );

    return interaction.reply({
      components: [stopped, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

