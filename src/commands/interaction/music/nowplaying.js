/**
 * PPLGBot - Command: Now Playing
 * Menampilkan lagu yang sedang diputar dengan progress bar
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

// Format time helper
function formatTime(ms) {
  if (!ms || ms === 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Create progress bar
function createProgressBar(current, total, size = 18) {
  if (!total || total === 0) return "▬".repeat(size) + "🔘";
  const percent = current / total;
  const progress = Math.round(size * percent);

  return "▬".repeat(progress) + "🔘" + "▬".repeat(size - progress);
}

module.exports = {
  name: "nowplaying",
  description: "Tampilkan lagu yang sedang diputar",
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
            "Tidak ada lagu yang sedang diputar di server ini."
          )
        );

      return interaction.reply({
        components: [nothingPlaying],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    const track = player.current;
    const currentTime = player.position;
    const totalTime = track.info.length;

    // Create progress bar
    const progressBar = createProgressBar(currentTime, totalTime, 18);
    const thumbnail = track.info.thumbnail || "https://i.imgur.com/AfFp7pu.png";

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
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(thumbnail)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.info.title}](${track.info.uri})**\n` +
              `by **${track.info.author}**\n\n` +
              `\`${formatTime(currentTime)}\` ${progressBar} \`${formatTime(totalTime)}\`\n\n` +
              `**Requested by:** ${track.info.requester?.username || "Unknown"}`
            )
          )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(player.paused ? `music_resume_${interaction.guild.id}` : `music_pause_${interaction.guild.id}`)
          .setEmoji(player.paused ? "▶️" : "⏸️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_skip_${interaction.guild.id}`)
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_stop_${interaction.guild.id}`)
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`loop_track_${interaction.guild.id}`)
          .setEmoji("🔂")
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

