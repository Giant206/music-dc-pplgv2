/**
 * PPLGBot - Main Entry Point
 * Sistem Musik Modern dengan Discord.js v14
 */

const { Client, Collection } = require("discord.js");
const { Riffy } = require("riffy");

// Import database
const db = require("./database/profile");

const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildVoiceStates",
        "GuildMessageReactions",
        "MessageContent",
        "DirectMessages",
    ],
});
require("dotenv").config();
client.config = require("./settings/config.js");
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();

// Initialize database (MongoDB)
db.initDatabase(client.config).then(success => {
    if (success) {
        console.log("[BOT] ✅ Database initialized successfully");
    } else {
        console.warn("[BOT] ⚠️ Database initialization failed - data will not persist!");
    }
});

client.riffy = new Riffy(client, client.config.nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: client.config.engine,
    restVersion: "v4",
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise);
    console.error("Reason:", reason);
});


process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});


client.on("error", (err) => {
    console.error("Client Error:", err);
});


client.on("shardError", (err, shardId) => {
    console.error(`Shard ${shardId} Error:`, err);
});

client.riffy.on("nodeError", (node, error) => {
    console.error(`Lavalink Node Error [${node.name}]:`, error);
});


process.on("warning", (warning) => {
    console.warn("Process Warning:", warning.name, warning.message);
});

["event", "riffy", "slashcommand"].forEach(file => {
    require(`./handlers/${file}`)(client);
});

client.login(process.env.TOKEN || "");

module.exports = client;

/**
 * ========================================
 * PPLGBot X GBinoo
 * Sistem Musik Modern
 * ========================================
 */
