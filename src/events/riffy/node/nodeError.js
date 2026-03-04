/**
 * PPLGBot - Event: Node Error
 * Dipanggil ketika ada error pada node Lavalink
 */

const logger = require("../../../utils/logger");

module.exports = {
    name: "nodeError",
    
    run: (client, node, error) => {
        logger.error(`❌ Error pada Node [${node.name}]: ${error.message}`);
        
        // Log stack trace for debugging
        if (error.stack) {
            logger.debug(error.stack);
        }
    }
};

/**
 * Node Error Event
 * Menangani error yang terjadi pada Lavalink node
 */

