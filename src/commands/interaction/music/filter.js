/**
 * PPLGBot - Command: Filter
 * Mengatur filter audio (bassboost, nightcore, vaporwave)
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
  name: "filter",
  description: "Atur filter audio (bassboost, nightcore, vaporwave)",
  
  // Permissions
  inVoice: true,
  sameVoice: true,
  player: true,

  options: [
    {
      name: "type",
      description: "Tipe filter",
      type: 3, // String
      required: false,
      choices: [
        { name: "Bassboost", value: "bassboost" },
        { name: "Nightcore", value: "nightcore" },
        { name: "Vaporwave", value: "vaporwave" },
        { name: "Clear", value: "clear" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);
    const filterType = interaction.options.getString("type");

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

    // Initialize filters if not exist
    if (!player.filters) {
      player.filters = {
        bassboost: false,
        nightcore: false,
        vaporwave: false
      };
    }

    // Apply filter
    let activeFilter = null;
    
    if (filterType && filterType !== "clear") {
      // Toggle filter
      player.filters[filterType] = !player.filters[filterType];
      activeFilter = filterType;
    } else if (filterType === "clear") {
      // Clear all filters
      player.filters = {
        bassboost: false,
        nightcore: false,
        vaporwave: false
      };
      
      // Clear filter on player
      if (player.resetFilter) {
        player.resetFilter();
      }
    }

    // Apply filters to player based on active filters
    const filters = [];
    
    if (player.filters.bassboost) {
      filters.push("bassboost");
      // Apply bassboost filter
      player.setFilter("bassboost", {
        equalizer: [
          { band: 0, gain: 0.2 },
          { band: 1, gain: 0.3 },
          { band: 2, gain: 0.3 },
          { band: 3, gain: 0.4 },
          { band: 4, gain: 0.4 },
          { band: 5, gain: 0.3 },
          { band: 6, gain: 0.2 },
          { band: 7, gain: 0.2 },
          { band: 8, gain: 0.15 },
          { band: 9, gain: 0.1 }
        ]
      });
    }
    
    if (player.filters.nightcore) {
      filters.push("nightcore");
      // Nightcore is typically playback speed + pitch
      player.setFilter("nightcore", {
        timescale: {
          speed: 1.1,
          pitch: 1.1,
          rate: 1.1
        }
      });
    }
    
    if (player.filters.vaporwave) {
      filters.push("vaporwave");
      player.setFilter("vaporwave", {
        equalizer: [
          { band: 0, gain: 0.3 },
          { band: 1, gain: 0 },
          { band: 2, gain: 0 },
          { band: 3, gain: 0 },
          { band: 4, gain: 0 },
          { band: 5, gain: -0.25 },
          { band: 6, gain: -0.25 },
          { band: 7, gain: 0 },
          { band: 8, gain: 0.25 },
          { band: 9, gain: 0.25 }
        ],
        timescale: {
          speed: 0.95,
          pitch: 0.95,
          rate: 1
        }
      });
    }

    // Build active filters text
    const activeFiltersText = Object.entries(player.filters)
      .filter(([_, active]) => active)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
      .join(", ") || "Tidak ada";

    // Create embed
    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🎛️ Filter Diperbarui")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Filter Aktif:** ${activeFiltersText}\n\n` +
          `${filterType === "clear" ? "Semua filter telah dihapus." : "Filter diterapkan pada lagu yang sedang diputar."}`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`filter_bassboost_${interaction.guild.id}`)
          .setLabel("Bassboost")
          .setEmoji("🎸")
          .setStyle(player.filters.bassboost ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_nightcore_${interaction.guild.id}`)
          .setLabel("Nightcore")
          .setEmoji("🌙")
          .setStyle(player.filters.nightcore ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_vaporwave_${interaction.guild.id}`)
          .setLabel("Vaporwave")
          .setEmoji("🌊")
          .setStyle(player.filters.vaporwave ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_clear_${interaction.guild.id}`)
          .setLabel("Clear")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

    return interaction.reply({ components: [embed, buttons], flags: MessageFlags.IsComponentsV2 });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 * Filter audio: Bassboost, Nightcore, Vaporwave
 */

