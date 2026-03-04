/**
 * PPLGBot - Event Handler
 * Memuat semua event dari folder events/bot
 */

const { readdirSync } = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (client) => {
    let eventCount = 0;

    // Get all subdirectories in events/bot
    const eventDirs = readdirSync(path.join(__dirname, '../events/bot'));
    
    for (const dir of eventDirs) {
        const eventPath = path.join(__dirname, '../events/bot', dir);
        
        // Check if it's a directory
        if (!readdirSync(eventPath).some(f => f.endsWith('.js'))) {
            continue;
        }
        
        const files = readdirSync(eventPath).filter(file => file.endsWith(".js"));

        for (const file of files) {
            try {
                const pull = require(path.join(eventPath, file));

                // Check if it's a function (simple event)
                if (typeof pull === 'function') {
                    pull(client);
                    eventCount++;
                    logger.debug(`📁 Loaded event: ${file.replace('.js', '')}`);
                }
                // Check if it has a name property (event emitter style)
                else if (pull && pull.name) {
                    // This is handled by riffy handler
                }
            } catch (err) {
                logger.error(`❌ Couldn't load event ${file}: ${err.message}`);
            }
        }
    }

    logger.success(`✅ Successfully loaded ${eventCount} events`);
};

/**
 * Event Handler
 * Loads all bot events
 */

