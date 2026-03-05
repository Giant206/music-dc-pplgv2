/**
 * PPLGBot - Command: Playlist
 * Mengelola playlist pengguna
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
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

// Playlist Schema
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerName: { type: String, default: "Unknown" },
  guildId: { type: String, default: null },
  isPublic: { type: Boolean, default: false },
  shareCode: { type: String, unique: true, sparse: true },
  tracks: [{
    title: String,
    artist: String,
    uri: String,
    thumbnail: String,
    duration: Number,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Playlist;

function getPlaylistModel() {
  if (!Playlist) {
    Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);
  }
  return Playlist;
}

module.exports = {
  name: "playlist",
  description: "Kelola playlist musik",

  options: [
    {
      name: "create",
      description: "Buat playlist baru",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "name",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        },
        {
          name: "public",
          description: "Jadikan playlist publik?",
          type: 5, // BOOLEAN
          required: false
        }
      ]
    },
    {
      name: "delete",
      description: "Hapus playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "name",
          description: "Nama playlist yang akan dihapus",
          type: 3, // STRING
          required: true
        }
      ]
    },
    {
      name: "add",
      description: "Tambah lagu ke playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "playlist",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        },
        {
          name: "title",
          description: "Judul lagu",
          type: 3, // STRING
          required: true
        }
      ]
    },
    {
      name: "remove",
      description: "Hapus lagu dari playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "playlist",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        },
        {
          name: "index",
          description: "Nomor lagu yang akan dihapus",
          type: 4, // INTEGER
          required: true
        }
      ]
    },
    {
      name: "list",
      description: "Lihat daftar playlist",
      type: 1, // SUB_COMMAND
    },
    {
      name: "play",
      description: "Putar playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "name",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        }
      ]
    },
    {
      name: "share",
      description: "Bagikan playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "name",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        }
      ]
    },
    {
      name: "public",
      description: "Ubah visibilitas playlist",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "name",
          description: "Nama playlist",
          type: 3, // STRING
          required: true
        },
        {
          name: "public",
          description: "Jadikan publik?",
          type: 5, // BOOLEAN
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "create") {
      return handleCreate(client, interaction);
    } else if (subCommand === "delete") {
      return handleDelete(client, interaction);
    } else if (subCommand === "add") {
      return handleAdd(client, interaction);
    } else if (subCommand === "remove") {
      return handleRemove(client, interaction);
    } else if (subCommand === "list") {
      return handleList(client, interaction);
    } else if (subCommand === "play") {
      return handlePlay(client, interaction);
    } else if (subCommand === "share") {
      return handleShare(client, interaction);
    } else if (subCommand === "public") {
      return handlePublic(client, interaction);
    }

    return handleHelp(client, interaction);
  }
};

function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function handleCreate(client, interaction) {
  const name = interaction.options.getString("name");
  const isPublic = interaction.options.getBoolean("public") || false;
  const userId = interaction.user.id;
  const username = interaction.user.username;

  try {
    const PlaylistModel = getPlaylistModel();
    
    // Check if playlist exists
    const existing = await PlaylistModel.findOne({ ownerId: userId, name: name });
    if (existing) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Sudah Ada")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** sudah ada.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Create playlist
    const shareCode = generateShareCode();
    const playlist = new PlaylistModel({
      name,
      ownerId: userId,
      ownerName: username,
      guildId: interaction.guildId,
      isPublic,
      shareCode,
      tracks: []
    });

    await playlist.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Playlist Dibuat")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${name}** berhasil dibuat!\n\n` +
          `Visibility: ${isPublic ? "🌐 Publik" : "🔒 Privat"}\n` +
          `Share Code: \`${shareCode}\``
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Create error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal membuat playlist: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleDelete(client, interaction) {
  const name = interaction.options.getString("name");
  const userId = interaction.user.id;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlist = await PlaylistModel.findOne({ ownerId: userId, name });
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** tidak ditemukan.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    await PlaylistModel.deleteOne({ _id: playlist._id });

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Playlist Dihapus")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Playlist **${name}** telah dihapus.`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Delete error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menghapus playlist: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleAdd(client, interaction) {
  const playlistName = interaction.options.getString("playlist");
  const title = interaction.options.getString("title");
  const userId = interaction.user.id;
  const username = interaction.user.username;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlist = await PlaylistModel.findOne({ ownerId: userId, name: playlistName });
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${playlistName}** tidak ditemukan.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Get current track from player if available
    const player = client.riffy.players.get(interaction.guild.id);
    let trackInfo = {
      title: title,
      artist: "Unknown",
      uri: "",
      thumbnail: "",
      duration: 0,
      addedBy: username
    };

    if (player && player.current) {
      trackInfo = {
        title: player.current.info.title || title,
        artist: player.current.info.author || "Unknown",
        uri: player.current.info.uri || "",
        thumbnail: player.current.info.thumbnail || "",
        duration: player.current.info.length || 0,
        addedBy: username
      };
    }

    playlist.tracks.push(trackInfo);
    playlist.updatedAt = new Date();
    await playlist.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Lagu Ditambahkan")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${trackInfo.title}** - ${trackInfo.artist}\n` +
          `ditambahkan ke playlist **${playlistName}**\n\n` +
          `Total: ${playlist.tracks.length} lagu`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Add error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menambahkan lagu: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleRemove(client, interaction) {
  const playlistName = interaction.options.getString("playlist");
  const index = interaction.options.getInteger("index") - 1;
  const userId = interaction.user.id;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlist = await PlaylistModel.findOne({ ownerId: userId, name: playlistName });
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${playlistName}** tidak ditemukan.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    if (index < 0 || index >= playlist.tracks.length) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Invalid Index")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Masukkan nomor antara 1-${playlist.tracks.length}`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    const removed = playlist.tracks.splice(index, 1)[0];
    playlist.updatedAt = new Date();
    await playlist.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Lagu Dihapus")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${removed.title}** - ${removed.artist}\n` +
          `dihapus dari playlist **${playlistName}**\n\n` +
          `Total: ${playlist.tracks.length} lagu`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Remove error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal menghapus lagu: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleList(client, interaction) {
  const userId = interaction.user.id;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlists = await PlaylistModel.find({ ownerId: userId });
    
    if (playlists.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0x38bdf8)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### 📋 Playlist Kamu")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Kamu belum memiliki playlist.\n\n" +
            "Gunakan `/playlist create <nama>` untuk membuat playlist!"
          )
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const listText = playlists
      .map((p, i) => `${i + 1}. **${p.name}** ${p.isPublic ? "🌐" : "🔒"} - ${p.tracks.length} lagu`)
      .join("\n");

    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### 📋 Playlist Kamu (${playlists.length})`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(listText)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] List error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal mengambil playlist: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handlePlay(client, interaction) {
  const name = interaction.options.getString("name");
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
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Kamu harus berada di voice channel.")
      );

    return interaction.editReply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }

  try {
    const PlaylistModel = getPlaylistModel();
    const userId = interaction.user.id;
    
    let playlist = await PlaylistModel.findOne({ ownerId: userId, name });
    
    // If not found by owner, try by share code
    if (!playlist) {
      playlist = await PlaylistModel.findOne({ shareCode: name.toUpperCase() });
    }

    // Also try finding public playlists
    if (!playlist) {
      playlist = await PlaylistModel.findOne({ isPublic: true, name: name });
    }
    
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** tidak ditemukan.`)
        );

      return interaction.editReply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    if (playlist.tracks.length === 0) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Kosong")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** tidak memiliki lagu.`)
        );

      return interaction.editReply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Create player
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

    // Add tracks to queue
    let addedCount = 0;
    for (const trackInfo of playlist.tracks) {
      const resolve = await client.riffy.resolve({
        query: trackInfo.title,
        requester: interaction.member
      });

      const { tracks } = resolve;
      if (tracks && tracks.length > 0) {
        player.queue.add(tracks[0]);
        addedCount++;
      }
    }

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ▶️ Playlist Diputar")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${playlist.name}** oleh **${playlist.ownerName}**\n\n` +
          `Ditambahkan: ${addedCount} lagu ke antrian`
        )
      );

    await interaction.editReply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

    if (!player.playing && !player.paused) {
      player.play();
    }

  } catch (err) {
    console.error("[Playlist] Play error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal memutar playlist: ${err.message}`)
      );

    return interaction.editReply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleShare(client, interaction) {
  const name = interaction.options.getString("name");
  const userId = interaction.user.id;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlist = await PlaylistModel.findOne({ ownerId: userId, name });
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** tidak ditemukan.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Generate new share code if needed
    if (!playlist.shareCode) {
      playlist.shareCode = generateShareCode();
      await playlist.save();
    }

    const embed = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔗 Bagikan Playlist")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${playlist.name}**\n\n` +
          `Share Code: \`${playlist.shareCode}\`\n\n` +
          `Gunakan: \`/playlist play ${playlist.shareCode}\`\n` +
          `Atau: \`/playlist play ${playlist.name}\` (untuk publik)`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Share error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal membagikan playlist: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handlePublic(client, interaction) {
  const name = interaction.options.getString("name");
  const isPublic = interaction.options.getBoolean("public");
  const userId = interaction.user.id;

  try {
    const PlaylistModel = getPlaylistModel();
    
    const playlist = await PlaylistModel.findOne({ ownerId: userId, name });
    if (!playlist) {
      const embed = new ContainerBuilder()
        .setAccentColor(0xf59e0b)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ⚠️ Playlist Tidak Ditemukan")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Playlist **${name}** tidak ditemukan.`)
        );

      return interaction.reply({
        components: [embed],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    playlist.isPublic = isPublic;
    playlist.updatedAt = new Date();
    await playlist.save();

    const embed = new ContainerBuilder()
      .setAccentColor(0x22c55e)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ✅ Visibilitas Diubah")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Playlist **${name}** sekarang ${isPublic ? "🌐 Publik" : "🔒 Privat"}`
        )
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2
    });

  } catch (err) {
    console.error("[Playlist] Public error:", err);
    
    const embed = new ContainerBuilder()
      .setAccentColor(0xef4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### ❌ Error")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Gagal mengubah visibilitas: ${err.message}`)
      );

    return interaction.reply({
      components: [embed],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}

async function handleHelp(client, interaction) {
  const embed = new ContainerBuilder()
    .setAccentColor(0x38bdf8)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("### 📋 Playlist Commands")
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "`/playlist create <nama>` - Buat playlist baru\n" +
        "`/playlist delete <nama>` - Hapus playlist\n" +
        "`/playlist add <playlist> <lagu>` - Tambah lagu\n" +
        "`/playlist remove <playlist> <index>` - Hapus lagu\n" +
        "`/playlist list` - Lihat semua playlist\n" +
        "`/playlist play <nama>` - Mainkan playlist\n" +
        "`/playlist share <nama>` - Bagikan playlist\n" +
        "`/playlist public <nama> <true/false>` - Ubah visibilitas"
      )
    );

  return interaction.reply({
    components: [embed],
    flags: MessageFlags.IsComponentsV2
  });
}

/**
 * PPLGBot - Playlist System
 * Menggunakan MongoDB untuk menyimpan playlist per user
 */

