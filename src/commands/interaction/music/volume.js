/**
 * PPLGBot - Command: Volume
 * Mengatur volume pemutaran musik
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType
} = require("discord.js");

module.exports = {
  name: "volume",
  description: "Atur volume pemutaran musik",
  inVoice: true,
  sameVoice: true,
  player: true,

  options: [
    {
      name: "volume",
      description: "Volume yang diinginkan (0-100)",
      type: ApplicationCommandOptionType.Number,
      required: true,
      min_value: 0,
      max_value: 100,
    },
  ],

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);
    const volume = interaction.options.getNumber("volume", true);

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

    // Set volume
    player.setVolume(volume);

    // Create success embed
    const success = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔊 Volume Diperbarui")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Volume telah diatur ke **${volume}%**`
        )
      );

    // Create volume buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`volume_down_${interaction.guild.id}`)
          .setLabel("-")
          .setEmoji("🔉")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`volume_50_${interaction.guild.id}`)
          .setLabel("50%")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`volume_up_${interaction.guild.id}`)
          .setLabel("+")
          .setEmoji("🔊")
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({
      components: [success, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

