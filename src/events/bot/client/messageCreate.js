/**
 * PPLGBot - Event: Message Create
 * Menangani pesan teks (prefix commands)
 */

const { PermissionsBitField } = require("discord.js");
const { prefix, developers } = require("../../../settings/config");
const logger = require("../../../utils/logger");

module.exports = (client) => {
    client.on("messageCreate", async (message) => {
        try {
            // Skip bots and DMs
            if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) {
                return;
            }

            // Parse command
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            if (cmd.length === 0) return;

            // Get command
            let command = client.commands.get(cmd);

            if (!command) {
                command = client.commands.get(client.aliases.get(cmd));
            }

            if (command) {
                // Check developer only
                if (command.developerOnly) {
                    if (!developers.includes(message.author.id)) {
                        return message.channel.send(`❌ ${command.name} adalah command khusus developer.`);
                    }
                }

                // Check user permissions
                if (command.userPermissions) {
                    if (!message.channel.permissionsFor(message.member).has(PermissionsBitField.resolve(command.userPermissions || []))) {
                        return message.channel.send(`❌ Kamu membutuhkan izin: ${command.userPermissions.join(", ")}`);
                    }
                }

                // Check client permissions
                if (command.clientPermissions) {
                    if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.resolve(command.clientPermissions || []))) {
                        return message.channel.send(`❌ Bot membutuhkan izin: ${command.clientPermissions.join(", ")}`);
                    }
                }

                // Check guild only
                if (command.guildOnly && !message.guildId) {
                    return message.channel.send(`${command.name} hanya bisa digunakan di server.`);
                }

                // Run command
                command.run(client, message, args);
                
                // Log command usage
                logger.cmd(`${prefix}${command.name} digunakan oleh ${message.author.tag} di ${message.guild.name}`);
            }
        } catch (err) {
            logger.error(`Error dalam messageCreate event: ${err.message}`);
            console.error("MessageCreate error:", err);

            return message.channel.send(`❌ Terjadi error: ${err.message}`);
        }
    });
};

/**
 * Message Create Event
 * Handles text/prefix commands (legacy)
 */


