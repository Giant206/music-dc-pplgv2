/**
 * PPLGBot - Event: Interaction Create
 * Menangani semua interaksi (slash commands & buttons)
 */

const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const db = require("../../../database/profile");
const logger = require("../../../utils/logger");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    // ============================================
    // 🔘 HANDLE BUTTONS
    // ============================================
    if (interaction.isButton()) {
      return handleButtonInteraction(client, interaction);
    }

    // ============================================
    // 🔘 HANDLE STRING SELECT MENUS
    // ============================================
    if (interaction.isStringSelectMenu()) {
      return handleSelectMenuInteraction(client, interaction);
    }

    // ============================================
    // 💬 HANDLE SLASH COMMANDS
    // ============================================
    if (!interaction.isCommand()) return;

    // Defensive: Ensure client exists
    if (!client) {
      console.error("❌ Client is undefined in interactionCreate!");
      return;
    }

    try {
      const command = client.slashCommands.get(interaction.commandName);

      // Defensive: Ensure command exists
      if (!command) {
        console.error(`❌ Command not found: ${interaction.commandName}`);
        return interaction.reply({
          content: `Command \`${interaction.commandName}\` tidak ditemukan.`,
          flags: 64,
        });
      }

      // Defensive: Ensure command has run function
      if (typeof command.run !== 'function') {
        console.error(`❌ Command ${interaction.commandName} missing run function`);
        return interaction.reply({
          content: `Command \`${interaction.commandName}\` rusak.`,
          flags: 64,
        });
      }

      // Get player and voice channel info
      const player = client.riffy.players.get(interaction.guild.id);
      const memberChannel = interaction.member?.voice?.channelId;
      const clientChannel = interaction.guild?.members?.me?.voice?.channelId;

      // ============================================
      // ❌ CHECK COMMAND EXISTS
      // ============================================
      if (!command) {
        return interaction.reply({
          content: `Command \`${interaction.commandName}\` tidak ditemukan.`,
          flags: 64,
        });
      }

      // ============================================
      // 🔒 CHECK DEVELOPER ONLY
      // ============================================
      if (command.developerOnly) {
        const owners = client.config.owners || client.config.developers || [];
        if (!owners.includes(interaction.user.id)) {
          return interaction.reply({
            content: "❌ Command ini hanya untuk owner bot.",
            flags: 64,
          });
        }
      }

      // ============================================
      // 🔒 CHECK USER PERMISSIONS
      // ============================================
      if (command.userPermissions) {
        const perms = interaction.channel.permissionsFor(interaction.member);
        if (!perms?.has(PermissionsBitField.resolve(command.userPermissions || []))) {
          return interaction.reply({
            content: `❌ Kamu membutuhkan izin: ${command.userPermissions.join(", ")}`,
            flags: 64,
          });
        }
      }

      // ============================================
      // 🔒 CHECK CLIENT PERMISSIONS
      // ============================================
      if (command.clientPermissions) {
        const perms = interaction.channel.permissionsFor(interaction.guild.members.me);
        if (!perms?.has(PermissionsBitField.resolve(command.clientPermissions || []))) {
          return interaction.reply({
            content: `❌ Bot membutuhkan izin: ${command.clientPermissions.join(", ")}`,
            flags: 64,
          });
        }
      }

      // ============================================
      // 🎤 CHECK VOICE CHANNEL (IN VOICE)
      // ============================================
      if (command.inVoice && !memberChannel) {
        return interaction.reply({
          content: "❌ Kamu harus berada di voice channel untuk menggunakan command ini.",
          flags: 64,
        });
      }

      // ============================================
      // 🔗 CHECK SAME VOICE CHANNEL
      // ============================================
      if (command.sameVoice && memberChannel !== clientChannel) {
        return interaction.reply({
          content: "❌ Kamu harus berada di voice channel yang sama dengan bot.",
          flags: 64,
        });
      }

      // ============================================
      // 🎵 CHECK PLAYER EXISTS
      // ============================================
      if (command.player && !player) {
        return interaction.reply({
          content: "❌ Tidak ada musik yang sedang diputar.",
          flags: 64,
        });
      }

      // ============================================
      // 🎵 CHECK CURRENT TRACK
      // ============================================
      if (command.current && (!player || !player.current)) {
        return interaction.reply({
          content: "❌ Tidak ada lagu yang sedang diputar.",
          flags: 64,
        });
      }

      // ============================================
      // ⏱️ COOLDOWN CHECK
      // ============================================
      if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Map());
      }

      const now = Date.now();
      const timestamps = client.cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `⏳ Harap tunggu ${timeLeft.toFixed(1)} detik lagi.`,
            flags: 64,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      // ============================================
      // ▶️ RUN COMMAND
      // ============================================
      await command.run(client, interaction, interaction.options);


      logger.cmd(command.name, interaction.user.tag, interaction.guild?.name || "DM");

    } catch (err) {
      // Check if interaction was already replied/deferred before trying to respond
      if (interaction.replied) {
        // Interaction already replied, try followUp
        try {
          return await interaction.followUp({
            content: `❌ Terjadi error: ${err.message}`,
            flags: 64
          });
        } catch (followUpErr) {
          console.error("Failed to send followUp:", followUpErr.message);
          return;
        }
      }
      
      if (interaction.deferred) {
        // Interaction was deferred, use followUp
        try {
          return await interaction.followUp({
            content: `❌ Terjadi error: ${err.message}`,
            flags: 64
          });
        } catch (followUpErr) {
          console.error("Failed to send followUp:", followUpErrErr.message);
          return;
        }
      }

      // Not yet replied, use reply
      return interaction.reply({
        content: `❌ Terjadi error: ${err.message}`,
        flags: 64
      });
    }
  });
};

// ============================================
// 🔘 BUTTON INTERACTION HANDLER
// ============================================
async function handleButtonInteraction(client, interaction) {
  const customId = interaction.customId;
  const parts = customId.split("_");
  const action = parts[0];
  const type = parts[1];
  const player = client.riffy.players.get(interaction.guild.id);

  try {
    // ============================================
    // 🎵 MUSIC PLAYER BUTTONS
    // ============================================
    
    // Pause/Resume
    if (action === "music" && (type === "pause" || type === "resume")) {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }

      if (player.paused) {
        player.pause(false);
        await interaction.message.edit({
          components: createPlayerButtons(true, interaction.guild.id)
        });
        return interaction.reply({ content: "▶️ Music resumed!" });
      } else {
        player.pause(true);
        await interaction.message.edit({
          components: createPlayerButtons(false, interaction.guild.id)
        });
        return interaction.reply({ content: "⏸️ Music paused!" });
      }
    }

    // Stop
    if (action === "music" && type === "stop") {
      if (!player) {
        return interaction.reply({ content: "❌ Tidak ada player aktif.", flags: 64 });
      }
      player.destroy();
      return interaction.reply({ content: "⏹️ Music stopped and disconnected!" });
    }

    // Skip
    if (action === "music" && type === "skip") {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }
      player.stop();
      return interaction.reply({ content: "⏭️ Skipped to next track!" });
    }

    // Queue
    if (action === "music" && type === "queue") {
      return interaction.reply({ content: "📋 Gunakan command `/queue` untuk melihat antrian." });
    }

    // Loop buttons
    if (action === "loop") {
      const modes = ["off", "track", "queue"];
      const currentMode = player?.loop || "off";
      const newMode = type;
      
      if (player) {
        player.setLoop(newMode);
      }
      
      return interaction.reply({ content: `🔁 Loop mode: ${newMode.toUpperCase()}` });
    }

    // Filter buttons
    if (action === "filter") {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }

      // Initialize filters
      if (!player.filters) {
        player.filters = { bassboost: false, nightcore: false, vaporwave: false };
      }

      // Toggle filter
      player.filters[type] = !player.filters[type];
      
      return interaction.reply({ 
        content: `🎛️ Filter ${type}: ${player.filters[type] ? "ON" : "OFF"}` 
      });
    }

    // Shuffle
    if (action === "shuffle" && type === "again") {
      const queueArr = Array.from(player.queue || []);
      if (!player || queueArr.length < 2) {
        return interaction.reply({ content: "❌ Antrian terlalu pendek.", flags: 64 });
      }

      // Fisher-Yates shuffle
      const current = player.queue.shift();
      for (let i = player.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [player.queue[i], player.queue[j]] = [player.queue[j], player.queue[i]];
      }
      player.queue.unshift(current);

      return interaction.reply({ content: "🔀 Antrian diacak!" });
    }

    // ============================================
    // ℹ️ INFO BUTTONS
    // ============================================
    
    // 247 Mode buttons
    if (customId.startsWith("247_")) {
      const guildId = interaction.guild.id;
      const mode247 = await db.get247Mode(guildId);
      
      if (customId === "247_off") {
        await db.set247Mode(guildId, { enabled: false });
        return interaction.reply({ content: "⏹️ Mode 247 dinonaktifkan!", flags: 64 });
      }
      
      if (customId === "247_status") {
        return interaction.reply({ 
          content: mode247 && mode247.enabled ? "✅ Mode 247 AKTIF" : "❌ Mode 247 NONAKTIF", 
          flags: 64 
        });
      }
    }

    // Profile buttons
    if (customId.startsWith("profile_")) {
      return interaction.reply({ content: "📝 Fitur edit profile segera hadir!", flags: 64 });
    }

    // Ping refresh
    if (customId === "ping_refresh") {
      const ping = client.ws.ping;
      return interaction.reply({ content: `📡 Ping: ${ping}ms`, flags: 64 });
    }

    // ============================================
    // 🔊 VOLUME BUTTONS
    // ============================================
    if (action === "volume") {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }

      let newVolume = player.volume || 100;

      if (type === "up") {
        newVolume = Math.min(200, newVolume + 10);
      } else if (type === "down") {
        newVolume = Math.max(0, newVolume - 10);
      } else if (type === "mute") {
        newVolume = player.volume === 0 ? (player.previousVolume || 100) : 0;
      } else if (type === "max") {
        newVolume = 200;
      } else if (type === "50") {
        newVolume = 50;
      }

      player.previousVolume = player.volume;
      player.setVolume(newVolume);

      return interaction.reply({ 
        content: `🔊 Volume: ${newVolume}%`, 
        flags: 64 
      });
    }

    // ============================================
    // ♾️ AUTOPLAY BUTTON
    // ============================================
    if (action === "music" && type === "autoplay") {
      if (!player) {
        return interaction.reply({ content: "❌ Tidak ada player aktif.", flags: 64 });
      }

      const newAutoplay = !player.isAutoplay;
      player.isAutoplay = newAutoplay;

      if (newAutoplay && typeof player.autoplay === "function") {
        player.autoplay(player);
      }

      return interaction.reply({ 
        content: newAutoplay ? "✅ Autoplay diaktifkan!" : "❌ Autoplay dinonaktifkan!" 
      });
    }

    // ============================================
    // ♾️ AUTOPLAY TOGGLE BUTTON (from autoplay command)
    // ============================================
    if (action === "autoplay" && type === "toggle") {
      if (!player) {
        return interaction.reply({ content: "❌ Tidak ada player aktif.", flags: 64 });
      }

      player.isAutoplay = !player.isAutoplay;

      if (player.isAutoplay && typeof player.autoplay === "function") {
        player.autoplay(player);
      }

      return interaction.reply({ 
        content: player.isAutoplay ? "✅ Autoplay diaktifkan!" : "❌ Autoplay dinonaktifkan!" 
      });
    }

    // ============================================
    // 📋 QUEUE PAGINATION BUTTONS
    // ============================================
    if (action === "queue") {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }

      if (type === "shuffle") {
        const qArr = Array.from(player.queue || []);
        if (player.queue.length < 2) {
          return interaction.reply({ content: "❌ Antrian terlalu pendek.", flags: 64 });
        }
        const current = player.queue.shift();
        for (let i = player.queue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [player.queue[i], player.queue[j]] = [player.queue[j], player.queue[i]];
        }
        player.queue.unshift(current);
        return interaction.reply({ content: "🔀 Antrian diacak!" });
      }

      if (type === "clear") {
        if (player.queue) {
          player.queue.clear();
        }
        return interaction.reply({ content: "🗑️ Antrian dikosongkan!" });
      }

      // prev, next, page buttons - handled by command collectors
      return interaction.reply({ content: "📋 Gunakan command `/queue` untuk melihat antrian.", flags: 64 });
    }

    // ============================================
    // 🎛️ FILTER CLEAR BUTTON
    // ============================================
    if (action === "filter" && type === "clear") {
      if (!player || !player.current) {
        return interaction.reply({ content: "❌ Tidak ada musik yang diputar.", flags: 64 });
      }

      if (player.filters) {
        player.filters = { bassboost: false, nightcore: false, vaporwave: false };
      }
      
      if (player.resetFilter) {
        player.resetFilter();
      }

      return interaction.reply({ content: "🎛️ Semua filter dihapus!" });
    }

    // ============================================
    // 🔌 LEAVE CONFIRM/CANCEL BUTTONS
    // ============================================
    if (action === "leave") {
      if (type === "confirm") {
        if (player) {
          player.destroy();
        }
        return interaction.reply({ content: "👋 Bot telah keluar dari voice channel!" });
      } else if (type === "cancel") {
        return interaction.reply({ content: "❌ Aksi dibatalkan.", flags: 64 });
      }
    }

    // ============================================
    // 🎵 MUSIC PLAY/JOIN BUTTONS (After stop/leave)
    // ============================================
    if (action === "music" && (type === "play" || type === "join")) {
      return interaction.reply({ content: "🔊 Gunakan command `/join` untuk masuk ke voice channel, lalu `/play` untuk memutar musik." });
    }

    // ============================================
    // 🔍 PLAY SEARCH BUTTONS (Search results)
    // ============================================
    if (action === "play") {
      // Search results are handled by the play command
      // This requires access to search results stored in memory
      return interaction.reply({ content: "🔍 Silakan gunakan command `/play` untuk mencari lagu.", flags: 64 });
    }

  } catch (error) {
    logger.error(`Button interaction error: ${error.message}`);
    return interaction.reply({ content: "❌ Terjadi error.", flags: 64 });
  }
}

// ============================================
// 🔘 SELECT MENU HANDLER
// ============================================
async function handleSelectMenuInteraction(client, interaction) {
  // Handle help select menu
  if (interaction.customId === "help_select") {
    // This is handled in help.js command
  }
}

// ============================================
// 🎛️ CREATE PLAYER BUTTONS HELPER
// ============================================
function createPlayerButtons(isPaused, guildId) {
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`music_pause_${guildId}`)
        .setEmoji(isPaused ? "▶️" : "⏸️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`music_skip_${guildId}`)
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`music_stop_${guildId}`)
        .setEmoji("⏹️")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`music_queue_${guildId}`)
        .setEmoji("📋")
        .setStyle(ButtonStyle.Secondary)
    );

  return [row];
}

/**
 * Interaction Create Event
 * Handles slash commands and button interactions
 */

