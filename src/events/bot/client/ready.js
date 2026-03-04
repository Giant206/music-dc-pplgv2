/**
 * PPLGBot - Event: Ready
 * Dipanggil ketika bot siap dan online
 */

const { ActivityType, Events } = require("discord.js");
const logger = require("../../../utils/logger");

module.exports = (client) => {
  client.on(Events.ClientReady, async () => {
    // Initialize Riffy
    client.riffy.init(client.user.id);
    
    // ============================================
    // 🎉 BOT LOGIN SUCCESS
    // ============================================
    logger.success(`🤖 PPLGBot online sebagai ${client.user.tag}`);
    logger.info(`📊 Bot berada di ${client.guilds.cache.size} server`);
    
    // Set presence/activity
    client.user.setPresence({
      activities: [
        {
          name: "PPLGBot | /help",
          type: ActivityType.Custom
        },
        {
          name: "Sistem Musik Modern",
          type: ActivityType.Custom
        }
      ],
      status: "dnd" // do not disturb (more professional)
    });

    // ============================================
    // ⏰ TIMED TASKS
    // ============================================
    
    // Update presence every 5 minutes
    setInterval(() => {
      const serverCount = client.guilds.cache.size;
      const playerCount = client.riffy.players.size;
      
      client.user.setPresence({
        activities: [
          {
            name: `${serverCount} Servers | ${playerCount} Players`,
            type: ActivityType.Custom
          },
          {
            name: "Sistem Musik Modern",
            type: ActivityType.Custom
          }
        ],
        status: "dnd"
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
 * Ready Event
 * Bot initialization and presence setup
 */

