/**
 * PPLGBot - Event: Node Connect
 * Dipanggil ketika node Lavalink terhubung
 */

const logger = require("../../../utils/logger");

module.exports = {
    name: "nodeConnect",
    
    run: (client, node) => {
        logger.riffy(`✅ Node [${node.name}] terhubung ke Lavalink server`);
        
        // Update node status
        node.isConnected = true;
    }
};

/**
 * Node Connect Event
 */

