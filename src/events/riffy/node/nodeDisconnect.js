/**
 * PPLGBot - Event: Node Disconnect
 * Dipanggil ketika node Lavalink terputus
 */

const logger = require("../../../utils/logger");

module.exports = {
    name: "nodeDisconnect",
    
    run: (client, node, reason) => {
        logger.warn(`⚠️ Node [${node.name}] terputus dari Lavalink server`);
        logger.warn(`Alasan: ${reason}`);
        
        // Update node status
        node.isConnected = false;
    }
};

/**
 * Node Disconnect Event
 */

