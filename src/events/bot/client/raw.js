/**
 * PPLGBot - Event: Raw
 * Menangani raw gateway events untuk Riffy voice
 */

const { GatewayDispatchEvents } = require("discord.js");

module.exports = (client) => {
    client.on("raw", (d) => {
        if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
        client.riffy.updateVoiceState(d);
    });
};

/**
 * PPLGBot X GBinoo - Sistem Musik Modern
 */
