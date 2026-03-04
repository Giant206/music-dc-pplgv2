/**
 * PPLGBot - Command: Lyrics
 * Menampilkan lirik lagu yang sedang diputar
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
const { getLyrics } = require("genius-lyrics-api");

// Chunk lyrics into pages
function chunkLyrics(text, linesPerChunk = 6) {
  const lines = text.split("\n").filter(Boolean);
  const chunks = [];
  for (let i = 0; i < lines.length; i += linesPerChunk) {
    chunks.push(lines.slice(i, i + linesPerChunk).join("\n"));
  }
  return chunks;
}

module.exports = {
  name: "lyrics",
  description: "Tampilkan lirik lagu yang sedang diputar",
  inVoice: true,
  sameVoice: true,
  player: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player || !player.current) {
      const nothingPlaying = new ContainerBuilder()
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
        components: [nothingPlaying],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Defer reply
    await interaction.deferReply({
      flags: MessageFlags.IsComponentsV2
    });

    const track = player.current;

    // Check for genius token
    if (!client.config.geniusToken) {
      const noToken = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Token Tidak Ditemukan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Token Genius tidak dikonfigurasi.\n" +
            "Tambahkan geniusToken di config.js untuk menggunakan fitur lirik."
          )
        );

      return interaction.editReply({
        components: [noToken]
      });
    }

    // Fetch lyrics
    const lyrics = await getLyrics({
      apiKey: client.config.geniusToken,
      title: track.info.title,
      artist: track.info.author,
      optimizeQuery: true
    });

    // ============================================
    // ❌ LYRICS NOT FOUND
    // ============================================
    if (!lyrics) {
      const notFound = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Lirik Tidak Ditemukan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Tidak dapat menemukan lirik untuk **${track.info.title}**.`
          )
        );

      return interaction.editReply({
        components: [notFound]
      });
    }

    // Split lyrics into chunks
    const chunks = chunkLyrics(lyrics);
    let index = 0;

    // Create container for current chunk
    const createContainer = (content) =>
      new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`### 🎤 ${track.info.title}`)
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(content)
        );

    // Send initial message
    const message = await interaction.editReply({
      components: [createContainer(chunks[index])]
    });

    // Auto-update lyrics based on song position (optional feature)
    // For now, just display the lyrics
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */


