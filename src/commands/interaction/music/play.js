/**
 * PPLGBot - Command: Play
 * Memutar lagu dari berbagai platform
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType
} = require("discord.js");

const logger = require("../../../utils/logger");

module.exports = {
  name: "play",
  description: "Putar lagu dari YouTube, Spotify, dll",
  inVoice: true,

  options: [
    {
      name: "query",
      description: "Nama lagu atau link untuk diputar",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice?.channel;

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
            "Kamu harus berada di voice channel untuk menggunakan command ini."
          )
        );

      return interaction.reply({
        components: [notInVC],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Defer reply
    await interaction.deferReply({
      flags: MessageFlags.IsComponentsV2
    });

    let player = client.riffy.players.get(interaction.guild.id);

    // Create player if not exists
    if (!player) {
      try {
        // First create the connection
        player = await client.riffy.createConnection({
          guildId: interaction.guild.id,
          voiceChannel: voiceChannel.id,
          textChannel: interaction.channel.id,
          deaf: true,
          mute: false
        });
        
        // Wait a moment for the connection to establish
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (connError) {
        logger.error(`Connection error: ${connError.message}`);
        logger.debug(connError.stack);
        
        const connFailed = new ContainerBuilder()
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
              `Gagal terhubung ke voice channel.\n\nError: ${connError.message}`
            )
          );

        return interaction.editReply({
          components: [connFailed],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    // Verify player is connected before proceeding
    if (!player || !player.voiceChannel) {
      const connFailed = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Koneksi Gagal")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Player tidak berhasil dibuat. Silakan coba lagi."
          )
        );

      return interaction.editReply({
        components: [connFailed],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Resolve the query
    const resolve = await client.riffy.resolve({
      query,
      requester: interaction.member
    });

    const { loadType, tracks, playlistInfo } = resolve;

    // No results
    if (!tracks || !tracks.length) {
      const noResults = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 🔍 Tidak Ada Hasil")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Tidak ada hasil yang ditemukan untuk query kamu."
          )
        );

      return interaction.editReply({
        components: [noResults],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Playlist
    if (loadType === "playlist") {
      for (const track of tracks) {
        track.info.requester = { id: interaction.user.id, username: interaction.user.username, globalName: interaction.user.globalName || interaction.user.username };
        player.queue.add(track);
      }

      const playlistContainer = new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 📋 Playlist Ditambahkan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${tracks.length} lagu** dari *${playlistInfo.name}* ditambahkan ke antrian.`
          )
        );

      await interaction.editReply({
        components: [playlistContainer],
        flags: MessageFlags.IsComponentsV2
      });

    } else {
      // Single track
      const track = tracks.shift();
      track.info.requester = { id: interaction.user.id, username: interaction.user.username, globalName: interaction.user.globalName || interaction.user.username };
      player.queue.add(track);

      const position = player.queue.size;
      const thumbnail = track.info.thumbnail || "https://i.imgur.com/AfFp7pu.png";
       
      const trackContainer = new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 🎵 Lagu Ditambahkan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
          new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(thumbnail)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.info.title}](${track.info.uri})**\n` +
              `by **${track.info.author}**\n\n` +
              `Position in queue: #${position}`
            )
          )
        );

      await interaction.editReply({
        components: [trackContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Start playing if not already
    if (!player.playing && !player.paused) {
      player.play();
    }
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */
