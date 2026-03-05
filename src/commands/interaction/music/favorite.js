/**
 * PPLGBot - Command: Favorite
 * Mengelola lagu favorit pengguna
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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require("discord.js");

const mongoose = require("mongoose");

// Lazy load mongoose models
let Favorite;

function getFavoriteModel() {
  if (!Favorite) {
    const favoriteSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      tracks: [{
        title: String,
        artist: String,
        uri: String,
        thumbnail: String,
        duration: Number,
        addedAt: { type: Date, default: Date.now }
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    Favorite = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
  }
  return Favorite;
}

module.exports = {
  name: "favorite",
  description: "Kelola lagu favoritmu",

  options: [
    {
      name: "add",
      description: "Tambah lagu ke favorit",
      type: 1,
      options: [
        {
          name: "title",
          description: "Judul lagu",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "remove",
      description: "Hapus lagu dari favorit",
      type: 1,
      options: [
        {
          name: "index",
          description: "Nomor lagu yang akan dihapus",
          type: 4,
          required: true
        }
      ]
    },
    {
      name: "list",
      description: "Lihat daftar favorit",
      type: 1
    },
    {
      name: "play",
      description: "Putar lagu favorit",
      type: 1,
      options: [
        {
          name: "index",
          description: "Nomor lagu yang akan diputar",
          type: 4,
          required: false
        }
      ]
    },
    {
      name: "clear",
      description: "Hapus semua favorit",
      type: 1
    }
  ],

  run: async (client, interaction) => {
    const userId = interaction.user.id;
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "add") {
      return handleAdd(client, interaction, userId);
    } else if (subCommand === "remove") {
      return handleRemove(client, interaction, userId);
    } else if (subCommand === "list") {
      return handleList(client, interaction, userId);
    } else if (subCommand === "play") {
      return handlePlay(client, interaction, userId);
    } else if (subCommand === "clear") {
      return handleClear(client, interaction, userId);
    }

    return handleList(client, interaction, userId);
  }
};

async function handleAdd(client, interaction, userId) {
  const title = interaction.options.getString("title");
  const player = client.riffy.players.get(interaction.guild.id);

  let trackInfo = {
    title: title,
    artist: "Unknown",
    uri: "",
    thumbnail: "",
    duration: 0
  };

  if (player && player.current) {
    trackInfo = {
      title: player.current.info.title || title,
      artist: player.current.info.author || "Unknown",
      uri: player.current.info.uri || "",
      thumbnail: player.current.info.thumbnail || "",
      duration: player.current.info.length || 0
    };
  }

  try {
    let favorite = await getFavoriteModel().findOne({ userId });
    
    if (!favorite) {
      favorite = new getFavoriteModel({ userId, tracks: [] });
    }

    const exists = favorite.tracks.find(t => t.title === trackInfo.title && t.artist === trackInfo.artist);
    if (exists) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Sudah Ada")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Lagu ini sudah ada di favoritmu!")
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    favorite.tracks.push(trackInfo);
    favorite.updatedAt = new Date();
    await favorite.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Ditambahkan ke Favorit")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${trackInfo.title}**\n oleh **${trackInfo.artist}**\n\n` +
          `Total favorit: ${favorite.tracks.length} lagu`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Favorite] Add error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menambahkan ke favorit: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleRemove(client, interaction, userId) {
  const index = interaction.options.getInteger("index") - 1;

  try {
    let favorite = await getFavoriteModel().findOne({ userId });
    
    if (!favorite || favorite.tracks.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Kosong")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Kamu belum memiliki lagu favorit!")
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    if (index < 0 || index >= favorite.tracks.length) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Invalid Index")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Masukkan nomor antara 1-${favorite.tracks.length}`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    const removed = favorite.tracks.splice(index, 1)[0];
    favorite.updatedAt = new Date();
    await favorite.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Dihapus dari Favorit")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${removed.title}**\n oleh **${removed.artist}**\n\n` +
          `Total favorit: ${favorite.tracks.length} lagu`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Favorite] Remove error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menghapus dari favorit: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleList(client, interaction, userId) {
  try {
    let favorite = await getFavoriteModel().findOne({ userId });
    
    if (!favorite || favorite.tracks.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⭐ Daftar Favorit")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Kamu belum memiliki lagu favorit.\n\n" +
            "Gunakan `/favorite add <judul>` untuk menambahkan lagu ke favorit!"
          )
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const displayTracks = favorite.tracks.slice(0, 10);
    const listText = displayTracks
      .map((track, i) => `${i + 1}. **${track.title}** - ${track.artist}`)
      .join("\n");

    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### ⭐ Daftar Favorit (${favorite.tracks.length} lagu)`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(listText)
      );

    if (favorite.tracks.length > 10) {
      embed.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\n*...dan ${favorite.tracks.length - 10} lagi*`
        )
      );
    }

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`favorite_play_0_${userId}`)
          .setLabel("Putar Semua")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
      );

    return interaction.reply({
      components: [embed, buttons],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Favorite] List error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal mengambil daftar favorit: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handlePlay(client, interaction, userId) {
  const index = interaction.options.getInteger("index");
  const voiceChannel = interaction.member.voice?.channel;

  // Defer reply since this command involves MongoDB and API calls
  await interaction.deferReply({
    flags: MessageFlags.IsComponentsV2
  });

  if (!voiceChannel) {
    const embed = new ContainerBuilder()
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
        new TextDisplayBuilder().setContent("Kamu harus berada di voice channel untuk memutar lagu.")
      );

    return interaction.editReply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }

  try {
    let favorite = await getFavoriteModel().findOne({ userId });
    
    if (!favorite || favorite.tracks.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Kosong")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Kamu belum memiliki lagu favorit!")
        );

      return interaction.editReply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    let player = client.riffy.players.get(interaction.guild.id);
    
    if (!player) {
      player = await client.riffy.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channel.id,
        deaf: true,
        mute: false
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let trackToPlay;
    if (index) {
      trackToPlay = favorite.tracks[index - 1];
    } else {
      trackToPlay = favorite.tracks[Math.floor(Math.random() * favorite.tracks.length)];
    }

    if (!trackToPlay) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Lagu Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Nomor lagu tidak valid!")
        );

    return interaction.editReply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
    }

    const resolve = await client.riffy.resolve({
      query: trackToPlay.title,
      requester: interaction.member
    });

    const { loadType, tracks } = resolve;

    if (!tracks || !tracks.length) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 🔍 Lagu Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Tidak dapat menemukan: **${trackToPlay.title}**`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    const track = tracks[0];
    player.queue.add(track);

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ⭐ Ditambahkan ke Antrian")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.info.title}](${track.info.uri})**\n` +
          `by **${track.info.author}**\n\n` +
          `Position: #${player.queue.size}`
        )
      );

    await interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

    if (!player.playing && !player.paused) {
      player.play();
    }

  } catch (err) {
    console.error("[Favorite] Play error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal memutar favorit: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleClear(client, interaction, userId) {
  try {
    let favorite = await getFavoriteModel().findOne({ userId });
    
    if (!favorite || favorite.tracks.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Kosong")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Kamu belum memiliki lagu favorit!")
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`favorite_confirm_clear_${userId}`)
          .setLabel("Ya, Hapus Semua")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`favorite_cancel_clear_${userId}`)
          .setLabel("Batal")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Secondary)
      );

    const embed = new ContainerBuilder()
      .setAccentColor(0xf59e0b)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ⚠️ Konfirmasi Hapus")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Apakah kamu yakin ingin menghapus **${favorite.tracks.length} lagu** dari favorit?\n\n` +
          `Tindakan ini tidak dapat dibatalkan!`
        )
      );

    return interaction.reply({
      components: [embed, buttons],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Favorite] Clear error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menghapus favorit: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

/**
 * PPLGBot - Favorite Song System
 */

