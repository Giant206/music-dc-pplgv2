/**
 * PPLGBot - Command: Queue
 * Menampilkan antrian lagu
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const ms = require("pretty-ms");

module.exports = {
  name: "queue",
  description: "Tampilkan antrian lagu",
  inVoice: true,
  sameVoice: true,
  player: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player || !player.current) {
      const noPlayer = new ContainerBuilder()
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
            "Tidak ada player aktif di server ini."
          )
        );

      return interaction.reply({
        components: [noPlayer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Get queue (max 10 items)
    const queue = player.queue.length > 9
      ? player.queue.slice(0, 9)
      : player.queue;

    // Now playing text
    const nowPlayingText =
      `**[${player.current.info.title}](${player.current.info.uri})**\n` +
      `Duration: ${ms(player.current.info.length)}\n\n` +
      `**Antrian:** ${player.queue.length} lagu`;

    // Up next text
    let upNextText = "";

    if (queue.length) {
      upNextText = queue
        .map(
          (track, index) =>
            `${index + 1}. [${track.info.title}](${track.info.uri})`
        )
        .join("\n");
    } else {
      upNextText = "Tidak ada lagu dalam antrian.";
    }

    // Create container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🎵 Sedang Diputar")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(nowPlayingText)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 📋 Berikutnya")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(upNextText)
      );

    // Set thumbnail if available
    if (player.current.info.thumbnail) {
      container.addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(player.current.info.thumbnail)
          )
      );
    }

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`shuffle_again_${interaction.guild.id}`)
          .setLabel("Acak")
          .setEmoji("🔀")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`loop_queue_${interaction.guild.id}`)
          .setLabel("Loop")
          .setEmoji("🔁")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_stop_${interaction.guild.id}`)
          .setLabel("Stop")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Danger)
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

