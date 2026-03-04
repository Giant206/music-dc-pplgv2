/**
 * PPLGBot - Command: Join
 * Bergabung ke voice channel
 */

const {
    ApplicationCommandType,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const logger = require("../../../utils/logger");

module.exports = {
    name: "join",
    description: "Bergabung ke voice channel",
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const member = interaction.member;
        const voiceChannel = member.voice?.channel;

        // ============================================
        // ❌ CHECK VOICE CHANNEL
        // ============================================
        if (!voiceChannel) {
            const notInVC = new ContainerBuilder()
                .setAccentColor(0xef4444)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("### 🔊 Join Voice Channel")
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "Kamu harus berada di voice channel terlebih dahulu."
                    )
                );

            return interaction.reply({
                components: [notInVC],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        }

        try {
            // Check if already connected
            let player = client.riffy.players.get(interaction.guild.id);

            if (player && player.voiceChannel) {
                const alreadyConnected = new ContainerBuilder()
                    .setAccentColor(0xf59e0b)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("### ⚠️ Sudah Terhubung")
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setDivider(true)
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `Bot sudah terhubung ke <#${player.voiceChannel}>`
                        )
                    );

                return interaction.reply({
                    components: [alreadyConnected],
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                });
            }

            // Create new connection
            player = await client.riffy.createConnection({
                guildId: interaction.guild.id,
                voiceChannel: voiceChannel.id,
                textChannel: interaction.channel.id,
                deaf: true,
                mute: false
            });

            // Wait for connection to establish
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verify connection
            if (!player || !player.voiceChannel) {
                throw new Error("Failed to establish voice connection");
            }

            const joined = new ContainerBuilder()
                .setAccentColor(0x22c55e)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("### 🎶 Terhubung")
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Berhasil terhubung ke <#${voiceChannel.id}>`
                    )
                );

            return interaction.reply({
                components: [joined],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            logger.error(`Join error: ${error.message}`);

            const failed = new ContainerBuilder()
                .setAccentColor(0xef4444)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("### ❌ Gagal Terhubung")
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "Gagal terhubung ke voice channel. Silakan coba lagi."
                    )
                );

            return interaction.reply({
                components: [failed],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        }
    }
};

/**
 * PPLGBot - Sistem Musik Modern
 */
