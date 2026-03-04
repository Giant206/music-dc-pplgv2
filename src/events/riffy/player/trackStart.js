/**
 * PPLGBot - Event: Track Start
 * Dipanggil ketika lagu dimulai
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
const { convertTime } = require("../../../utils/convert");

module.exports = {
  name: "trackStart",
  
  run: async (client, player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    // Format track info
    const formatString = (str, maxLength) =>
      str.length > maxLength
        ? str.substring(0, maxLength - 3) + "..."
        : str;

    const trackTitle = formatString(
      track.info.title || "Unknown",
      50
    ).replace(/ - Topic$/, "");

    const trackAuthor = formatString(
      track.info.author || "Unknown",
      30
    ).replace(/ - Topic$/, "");

    const trackDuration = track.info.isStream
      ? "LIVE"
      : convertTime(track.info.length);

    const thumbnail = track.info.thumbnail || "https://i.imgur.com/AfFp7pu.png";

    // Create container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8) // Accent blue
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
              `### [${trackTitle}](${track.info.uri})\n\n` +
              `**Artist:** ${trackAuthor}\n` +
              `**Durasi:** ${trackDuration}\n\n` +
              `**Requested by:** ${track.info.requester?.username || "Unknown"}`
            )
          )
      );

    // Create player buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`music_pause_${player.guildId}`)
          .setEmoji("⏸️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_skip_${player.guildId}`)
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`music_stop_${player.guildId}`)
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`music_queue_${player.guildId}`)
          .setEmoji("📋")
          .setStyle(ButtonStyle.Secondary)
      );

    await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, buttons]
    });
  }
};

/**
 * Track Start Event
 * Shows now playing embed with buttons
 */

