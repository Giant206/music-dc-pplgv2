/**
 * PPLGBot - Event: Ready
 * Dipanggil ketika bot siap dan online
 */

const { ActivityType, Events } = require("discord.js");
const logger = require("../../../utils/logger");
const db = require("../../../database/profile");

module.exports = (client) => {
  client.on(Events.ClientReady, async () => {
    // Initialize Riffy
    client.riffy.init(client.user.id);
    
    // ============================================
    // 🎉 BOT LOGIN SUCCESS
    // ============================================
    logger.success(`🤖 PPLGBot online sebagai ${client.user.tag}`);
    logger.info(`📊 Bot berada di ${client.guilds.cache.size} server`);
    
    // Set presence/activity with dynamic rotation
    const statuses = [
      { name: "🎶 Music & Project", type: ActivityType.Listening },
      { name: "🔥 GianMasbro", type: ActivityType.Playing },
      { name: "💥 PPLGBot", type: ActivityType.Playing },
      { name: "💡 p!help | Butuh Bantuan?", type: ActivityType.Listening },
      { name: "Sistem Musik Modern", type: ActivityType.Custom }
    ];

    const rotateStatus = () => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      client.user.setPresence({
        activities: [
          {
            name: status.name,
            type: status.type
          }
        ],
        status: "online" // Options: "idle", "dnd", "online"
      });
    };

    // Initial status
    rotateStatus();

    // Rotate status every 30 seconds
    setInterval(rotateStatus, 30 * 1000);

    // ============================================
    // 🎧 247 MODE AUTO-RECONNECT
    // ============================================
    try {
      await setup247Mode(client);
    } catch (err) {
      logger.error(`❌ Error setup 247 mode: ${err.message}`);
    }

    // ============================================
    // ⏰ TIMED TASKS
    // ============================================
    
    // Update presence with server/player count every 5 minutes
    setInterval(() => {
      const serverCount = client.guilds.cache.size;
      const playerCount = client.riffy.players.size;
      
      client.user.setPresence({
        activities: [
          {
            name: `${serverCount} Servers | ${playerCount} Players`,
            type: ActivityType.Custom
          }
        ],
        status: "online"
      });
    }, 5 * 60 * 1000); // 5 minutes

    // Log memory usage every 10 minutes
    setInterval(() => {
      const memory = process.memoryUsage();
      const heapUsed = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memory.heapTotal / 1024 / 1024);
      
      logger.debug(`💾 Memory: ${heapUsed}MB / ${heapTotal}MB`);
    }, 10 * 60 * 1000); // 10 minutes
  });
};

/**
 * Setup 247 Mode Auto-Reconnect
 * Reconnects to voice channels for guilds with 247 mode enabled
 */
async function setup247Mode(client) {
  try {
    const guilds247 = await db.getAll247Guilds();
    
    if (!guilds247 || guilds247.length === 0) {
      logger.debug("🎵 Tidak ada server dengan mode 247");
      return;
    }

    logger.info(`🎧 Mode 247: Men reconnect ke ${guilds247.length} server...`);

    for (const guildData of guilds247) {
      const { guildId, voiceChannelId, textChannelId, volume, autoplay, loop } = guildData;

      // Check if guild still exists
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        logger.warn(`⚠️ Guild ${guildId} tidak ditemukan, menghapus mode 247`);
        await db.remove247Mode(guildId);
        continue;
      }

      // Check if voice channel still exists
      const voiceChannel = client.channels.cache.get(voiceChannelId);
      if (!voiceChannel) {
        logger.warn(`⚠️ Voice channel ${voiceChannelId} tidak ditemukan di guild ${guildId}, menghapus mode 247`);
        await db.remove247Mode(guildId);
        continue;
      }

      // Check if text channel still exists
      const textChannel = client.channels.cache.get(textChannelId);
      if (!textChannel) {
        logger.warn(`⚠️ Text channel ${textChannelId} tidak ditemukan di guild ${guildId}`);
        // Continue anyway, we can still play without text channel
      }

      try {
        // Create new player connection
        const player = await client.riffy.createConnection({
          guildId: guildId,
          voiceChannel: voiceChannelId,
          textChannel: textChannelId || undefined,
          deaf: true,
          mute: false
        });

        // Restore volume
        if (volume) {
          player.setVolume(volume);
        }

        // Restore loop mode
        if (loop && loop !== "off") {
          player.setLoop(loop);
        }

        // Start autoplay if enabled
        if (autoplay && typeof player.autoplay === "function") {
          player.autoplay(player);
        }

        logger.info(`✅ Mode 247 aktif: ${guild.name} (${voiceChannel.name})`);
        
      } catch (err) {
        logger.error(`❌ Gagal koneksi ke ${guildId}: ${err.message}`);
      }
    }

    logger.success(`🎉 Selesai menghubungkan ke mode 247`);

  } catch (err) {
    logger.error(`❌ Error setup 247 mode: ${err.message}`);
  }
}

/**
 * Ready Event
 * Bot initialization and presence setup
 */

