/**
 * PPLGBot - Command: Filter
 * Mengatur filter audio (bassboost, nightcore, vaporwave, dll)
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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require("discord.js");

module.exports = {
  name: "filter",
  description: "Atur filter audio",
  
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
        { name: "Tremolo", value: "tremolo" },
        { name: "Vibrato", value: "vibrato" },
        { name: "Rotation", value: "rotation" },
        { name: "Distortion", value: "distortion" },
        { name: "LowPass", value: "lowpass" },
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
        vaporwave: false,
        tremolo: false,
        vibrato: false,
        rotation: false,
        distortion: false,
        lowpass: false
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
        vaporwave: false,
        tremolo: false,
        vibrato: false,
        rotation: false,
        distortion: false,
        lowpass: false
      };
      
      // Clear filter on player
      try {
        if (typeof player.setFilters === "function") {
          player.setFilters({});
        } else if (typeof player.resetFilter === "function") {
          player.resetFilter();
        }
      } catch (e) {
        console.log("[Filter] reset not supported");
      }
    }

    // Apply filters to player based on active filters
    const filters = {};
    
    try {
      if (player.filters.bassboost) {
        filters.equalizer = [
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
        ];
      }
      
      if (player.filters.nightcore) {
        filters.timescale = {
          speed: 1.1,
          pitch: 1.1,
          rate: 1.1
        };
      }
      
      if (player.filters.vaporwave) {
        filters.equalizer = filters.equalizer || [
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
        ];
        filters.timescale = {
          speed: 0.95,
          pitch: 0.95,
          rate: 1
        };
      }
      
      if (player.filters.tremolo) {
        filters.tremolo = {
          frequency: 5,
          depth: 0.5
        };
      }
      
      if (player.filters.vibrato) {
        filters.vibrato = {
          frequency: 5,
          depth: 0.5
        };
      }
      
      if (player.filters.rotation) {
        filters.rotation = {
          rotationHz: 0.5
        };
      }
      
      if (player.filters.distortion) {
        filters.distortion = {
          sinOffset: 0,
          sinScale: 1,
          cosOffset: 0,
          cosScale: 1,
          tanOffset: 0,
          tanScale: 1,
          offset: 0,
          scale: 1
        };
      }
      
      if (player.filters.lowpass) {
        filters.lowPass = {
          smoothing: 50,
          frequency: 20000
        };
      }

      // Apply filters to player
      if (Object.keys(filters).length > 0) {
        try {
          if (typeof player.setFilters === "function") {
            player.setFilters(filters);
          } else if (typeof player.setFilter === "function") {
            player.setFilter("custom", filters);
          }
        } catch (e) {
          console.log("[Filter] Error applying filters:", e.message);
        }
      }
    } catch (e) {
      console.log("[Filter] Error building filter config:", e.message);
    }

    // Build active filters text
    const activeFiltersList = Object.entries(player.filters)
      .filter(([_, active]) => active)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    
    const activeFiltersText = activeFiltersList.join(", ") || "Tidak ada";

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

    // Create buttons for main filters
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
          .setStyle(player.filters.vaporwave ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

    // Second row buttons for advanced filters
    const buttons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`filter_tremolo_${interaction.guild.id}`)
          .setLabel("Tremolo")
          .setEmoji("〰️")
          .setStyle(player.filters.tremolo ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_vibrato_${interaction.guild.id}`)
          .setLabel("Vibrato")
          .setEmoji("🌊")
          .setStyle(player.filters.vibrato ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_lowpass_${interaction.guild.id}`)
          .setLabel("LowPass")
          .setEmoji("🔈")
          .setStyle(player.filters.lowpass ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`filter_clear_${interaction.guild.id}`)
          .setLabel("Clear")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

    return interaction.reply({ components: [embed, buttons, buttons2], flags: MessageFlags.IsComponentsV2 });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 * Filter audio: Bassboost, Nightcore, Vaporwave, Tremolo, Vibrato, LowPass
 */

