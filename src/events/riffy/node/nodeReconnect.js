/**
 * PPLGBot - Event: Node Reconnect
 * Dipanggil ketika node Lavalink sedang mencoba reconnect
 */

const logger = require("../../../utils/logger");

module.exports = {
    name: "nodeReconnect",
    
    run: (client, node) => {
        logger.info(`🔄 Node [${node.name}] sedang mencoba terhubung kembali...`);
        
        // Store reconnect attempt info
        node.reconnectAttempts = (node.reconnectAttempts || 0) + 1;
        logger.debug(`Percobaan reconnect ke-${node.reconnectAttempts} untuk node [${node.name}]`);
    }
};

/**
 * Node Reconnect Event
 * Auto reconnect functionality untuk Lavalink node
 */

