/**
 * PPLGBot - Riffy Handler
 * Memuat semua event Riffy/Lavalink
 */

const { readdirSync } = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (client) => {
    let eventCount = 0;

    // Get all subdirectories in events/riffy
    const eventDirs = readdirSync(path.join(__dirname, '../events/riffy'));
    
    for (const dir of eventDirs) {
        const eventPath = path.join(__dirname, '../events/riffy', dir);
        
        // Check if it's a directory with event files
        if (!readdirSync(eventPath).some(f => f.endsWith('.js'))) {
            continue;
        }
        
        const files = readdirSync(eventPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const pull = require(path.join(eventPath, file));

                // Check if it has a name property
                if (pull && pull.name) {
                    // Set up event listener
                    if (typeof pull.run === 'function') {
                        client.riffy.on(pull.name, ( ...args) => pull.run(client, ...args));
                        eventCount++;
                        logger.debug(`🎵 Loaded riffy event: ${pull.name}`);
                    }
                }
            } catch (err) {
                logger.error(`❌ Couldn't load riffy event ${file}: ${err.message}`);
            }
        }
    }

    logger.success(`✅ Successfully loaded ${eventCount} riffy events`);
};

/**
 * Riffy Handler
 * Loads all Riffy/Lavalink events
 */

