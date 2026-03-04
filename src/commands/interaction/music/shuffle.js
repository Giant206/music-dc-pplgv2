/**
 * PPLGBot - Command: Shuffle
 * Mengacak antrian lagu
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
  name: "shuffle",
  description: "Mengacak antrian lagu",
  
  // Permissions
  inVoice: true,
  sameVoice: true,
  player: true,

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player || !player.current) {
      const embed = new ContainerBuilder()
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
          new TextDisplayBuilder().setContent("Tidak ada lagu yang sedang diputar.")
        );

      return interaction.reply({ components: [embed], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    // ============================================
    // ❌ CHECK QUEUE
    // ============================================
    if (player.queue.length < 2) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Antrian Terlalu Pendek")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Minimal perlu 2 lagu dalam antrian untuk diacak."
          )
        );

      return interaction.reply({ components: [embed], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    // ============================================
    // 🔀 SHUFFLE QUEUE
    // ============================================
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Shuffle the queue (keep current track at position 0)
    const currentTrack = player.queue.shift();
    shuffleArray(player.queue);
    player.queue.unshift(currentTrack);

    // Create embed
    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔀 Antrian Diacak")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${player.queue.length} lagu** dalam antrian telah diacak secara acak.\n\n` +
          `Lagu yang sedang diputar tetap di posisi pertama.`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`shuffle_again_${interaction.guild.id}`)
          .setLabel("Acak Lagi")
          .setEmoji("🔀")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`music_queue_${interaction.guild.id}`)
          .setLabel("Lihat Antrian")
          .setEmoji("📋")
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({ components: [embed, buttons], flags: MessageFlags.IsComponentsV2 });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 * Menggunakan Fisher-Yates shuffle algorithm
 */

