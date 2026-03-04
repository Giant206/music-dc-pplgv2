/**
 * PPLGBot - Command: Loop
 * Mengatur mode loop (off/song/queue)
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
  name: "loop",
  description: "Atur mode loop (off/song/queue)",
  
  // Permissions
  inVoice: true,
  sameVoice: true,
  player: true,

  options: [
    {
      name: "mode",
      description: "Mode loop",
      type: 3, // String
      required: false,
      choices: [
        { name: "Off", value: "off" },
        { name: "Track", value: "track" },
        { name: "Queue", value: "queue" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);
    const modeOption = interaction.options.getString("mode");

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

    // Get current loop mode
    let currentMode = player.loop || "off";
    
    // If mode specified in options, use it
    if (modeOption) {
      currentMode = modeOption;
      player.setLoop(modeOption);
    } else {
      // Toggle mode
      const modes = ["off", "track", "queue"];
      const currentIndex = modes.indexOf(currentMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      player.setLoop(nextMode);
      currentMode = nextMode;
    }

    // Get mode description
    const modeDescriptions = {
      off: "Loop dinonaktifkan",
      track: "Loop lagu aktif (mengulang lagu yang sama)",
      queue: "Loop antrian aktif (mengulang seluruh antrian)"
    };

    // Create embed
    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔁 Mode Loop Diperbarui")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Mode Saat Ini:** ${currentMode.toUpperCase()}\n\n` +
          `${modeDescriptions[currentMode]}`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`loop_off_${interaction.guild.id}`)
          .setLabel("Off")
          .setEmoji("⏺️")
          .setStyle(currentMode === "off" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`loop_track_${interaction.guild.id}`)
          .setLabel("Track")
          .setEmoji("🔂")
          .setStyle(currentMode === "track" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`loop_queue_${interaction.guild.id}`)
          .setLabel("Queue")
          .setEmoji("🔁")
          .setStyle(currentMode === "queue" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

    return interaction.reply({ components: [embed, buttons], flags: MessageFlags.IsComponentsV2 });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */

