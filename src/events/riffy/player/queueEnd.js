/**
 * PPLGBot - Event: Queue End
 * Dipanggil ketika antrian lagu habis
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

const db = require("../../../database/profile");

module.exports = {
  name: "queueEnd",
  
  run: async (client, player) => {
    // Delete previous message if exists
    if (player.message) {
      player.message.delete().catch(() => {});
    }

    const channel = client.channels.cache.get(player.textChannel);
    
    // Check 247 mode - if enabled, don't destroy player
    const mode247 = db.get247Mode(player.guildId);
    if (mode247.enabled) {
      // Bot stays connected in 247 mode
      if (channel) {
        const container = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 🎵 Mode 247 Aktif")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Antrian habis, tapi bot tetap stay di voice channel (Mode 247).\n\n" +
              "Gunakan `/play` untuk memutar lagu lagi."
            )
          );

        channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        }).catch(() => {});
      }
      return;
    }

    // Check for autoplay
    if (player.isAutoplay) {
      if (typeof player.autoplay === "function") {
        player.autoplay(player);
      }
      return;
    }

    // Destroy player (normal mode)
    player.destroy();

    // Send queue end message
    if (!channel) return;
    
    const container = new ContainerBuilder()
      .setAccentColor(0xf59e0b)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 📋 Antrian Habis")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "Semua lagu telah diputar.\n" +
          "Terima kasih telah menggunakan PPLGBot!\n\n" +
          "Gunakan `/play` untuk memutar lagu lagi."
        )
      );

    channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    }).catch(() => {});
  }
};

/**
 * PPLGBot X GBinoo - Queue End with 247 Mode Support
 */

