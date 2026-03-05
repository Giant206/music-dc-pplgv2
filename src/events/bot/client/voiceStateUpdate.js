/**
 * PPLGBot - Event: Voice State Update
 * Menghandle ketika user join/leave voice channel
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const db = require("../../../database/profile");

const LEAVE_TIMEOUT = 60 * 1000;
const leaveTimers = new Map();

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const player = client.riffy?.players?.get(oldState.guild.id);
    const mode247 = await db.get247Mode(oldState.guild.id);
    
    // Skip if 247 mode is enabled - bot stays in channel
    if (mode247 && mode247.enabled) {
      // Still handle auto-resume when someone joins
      const newBotChannel = newState.guild.members.me?.voice.channel;
      if (newBotChannel && newState.channelId === newBotChannel.id) {
        const members = newBotChannel.members.filter(m => !m.user.bot);
        if (members.size > 0 && player?.paused) {
          if (leaveTimers.has(newState.guild.id)) {
            clearTimeout(leaveTimers.get(newState.guild.id));
            leaveTimers.delete(newState.guild.id);
          }
          player.pause(false);
        }
      }
      return;
    }

    const botId = client.user.id;
    const oldBotChannel = oldState.guild.members.me?.voice.channel;
    const newBotChannel = newState.guild.members.me?.voice.channel;

    // ============================================
    // 👋 AUTO PAUSE - KETIKA SEMUA ORANG KELUAR
    // ============================================
    if (oldBotChannel && oldState.channelId === oldBotChannel.id) {
      const members = oldBotChannel.members.filter(m => !m.user.bot);
      if (members.size === 0 && player && !player.paused) {
        player.pause(true);
        
        const textChannel = client.channels.cache.get(player.textChannel);
        if (!textChannel) return;

        const embed = new ContainerBuilder()
          .setAccentColor(0xf59e0b)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ⏸️ Musik Dijeda")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Semua orang keluar dari voice channel.\nMusik dijeda, menunggu 1 menit sebelum berhenti."
            )
          );

        textChannel.send({ 
          components: [embed],
          flags: MessageFlags.IsComponentsV2 
        });

        if (!leaveTimers.has(oldState.guild.id)) {
          const timeout = setTimeout(() => {
            const stillEmpty = oldBotChannel.members.filter(m => !m.user.bot).size === 0;
            if (stillEmpty) {
              player.stop();
              player.destroy();
              
              const stopEmbed = new ContainerBuilder()
                .setAccentColor(0xef4444)
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("### 🛑 Musik Berhenti")
                )
                .addSeparatorComponents(
                  new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    "Tidak ada yang bergabung dalam 1 menit.\nMusik dihentikan dan bot meninggalkan voice channel."
                  )
                );
              
              textChannel.send({ 
                components: [stopEmbed],
                flags: MessageFlags.IsComponentsV2 
              });
            }
            leaveTimers.delete(oldState.guild.id);
          }, LEAVE_TIMEOUT);

          leaveTimers.set(oldState.guild.id, timeout);
        }
      }
    }

    // ============================================
    // ▶️ AUTO RESUME - KETIKA ADA ORANG JOIN
    // ============================================
    if (newBotChannel && newState.channelId === newBotChannel.id) {
      const members = newBotChannel.members.filter(m => !m.user.bot);
      if (player && members.size > 0 && player.paused) {
        if (leaveTimers.has(newState.guild.id)) {
          clearTimeout(leaveTimers.get(newState.guild.id));
          leaveTimers.delete(newState.guild.id);
        }
        
        player.pause(false);
        
        const textChannel = client.channels.cache.get(player.textChannel);
        if (!textChannel) return;

        const embed = new ContainerBuilder()
          .setAccentColor(0x22c55e)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ▶️ Musik Dilanjutkan")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Seseorang bergabung ke voice channel.\nMusik dilanjutkan!"
            )
          );

        textChannel.send({ 
          components: [embed],
          flags: MessageFlags.IsComponentsV2 
        });
      }
    }

    // ============================================
    // 🔇 SERVER MUTE HANDLER
    // ============================================
    if (newState.id === botId) {
      if (!oldState.channelId) return;

      if (oldState.serverMute !== newState.serverMute) {
        if (!player) return;
        
        const textChannel = client.channels.cache.get(player.textChannel);
        if (!textChannel) return;

        const embed = new ContainerBuilder()
          .setAccentColor(newState.serverMute ? 0xef4444 : 0x22c55e)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              newState.serverMute ? "### 🔇 Bot Di-Mute Serverside" : "### 🔊 Bot Di-Unmute Serverside"
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              newState.serverMute 
                ? "Bot telah di-mute oleh admin server." 
                : "Bot telah di-unmute oleh admin server."
            )
          );

        textChannel.send({ 
          components: [embed],
          flags: MessageFlags.IsComponentsV2 
        });
      }
    }
  });
};

/**
 * PPLGBot X GBinoo - Sistem Musik Modern
 */
