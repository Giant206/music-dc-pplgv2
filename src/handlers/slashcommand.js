/**
 * PPLGBot - Slash Command Handler
 * Memuat dan meregister semua slash commands
 */

const { readdirSync } = require('fs');
const path = require('path');
const { REST, Routes, GatewayIntentBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = async (client) => {
    const slashCommands = [];
    let commandCount = 0;

    // ============================================
    // 📁 LOAD COMMANDS FROM DIRECTORIES
    // ============================================
    const commandDir = path.join(__dirname, '../commands/interaction');
    
    // Get all subdirectories (categories)
    const categories = readdirSync(commandDir);

    for (const category of categories) {
        const categoryPath = path.join(commandDir, category);
        
        // Skip non-directories
        if (!readdirSync(categoryPath).some(f => f.endsWith('.js'))) {
            continue;
        }
        
        const commandFiles = readdirSync(categoryPath).filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            try {
                const pull = require(path.join(categoryPath, file));

                // Validate command
                if (!pull.name || !pull.description) {
                    logger.warn(`⚠️ Command ${file} tidak memiliki name atau description`);
                    continue;
                }

                // Store command data
                const commandData = {};
                for (const key in pull) {
                    commandData[key.toLowerCase()] = pull[key];
                }

                slashCommands.push(commandData);
                pull.category = category;
                client.slashCommands.set(pull.name, pull);
                commandCount++;

                logger.debug(`📝 Loaded command: ${pull.name} (${category})`);

            } catch (err) {
                logger.error(`❌ Gagal memuat command ${file}: ${err.message}`);
                continue;
            }
        }
    }

    logger.success(`✅ Total slash commands loaded: ${commandCount}`);

    // ============================================
    // 📝 CHECK CLIENT ID
    // ============================================
    if (!client.config.clientid) {
        logger.error("❌ Client ID tidak ditemukan di config.js");
        return process.exit(1);
    }

    // ============================================
    // 📡 REGISTER SLASH COMMANDS
    // ============================================
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        // Check if development mode is enabled
        const devMode = client.config.devMode || false;
        const devGuildId = client.config.devGuildId;

        if (devMode && devGuildId) {
            // Register to specific guild (faster for development)
            await rest.put(
                Routes.applicationGuildCommands(client.config.clientid, devGuildId),
                { body: slashCommands }
            );
            logger.success(`✅ Registered ${commandCount} commands to dev guild: ${devGuildId}`);
        } else {
            // Register globally
            await rest.put(
                Routes.applicationCommands(client.config.clientid),
                { body: slashCommands }
            );
            logger.success(`✅ Registered ${commandCount} commands globally`);
        }

        logger.info(`📋 Slash commands ready to use!`);

    } catch (err) {
        logger.error(`❌ Gagal meregister commands: ${err.message}`);
        
        // Log more details if available
        if (err.response) {
            logger.debug(`Response: ${JSON.stringify(err.response.data)}`);
        }
    }
};

/**
 * Slash Command Handler
 * Loads and registers all slash commands
 * Supports development mode for faster testing
 */

