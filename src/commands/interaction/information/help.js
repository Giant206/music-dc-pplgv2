/**
 * PPLGBot - Command: Help
 * Menampilkan semua command yang tersedia dengan tema dark mode modern
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

// Command details with usage info
const COMMAND_DETAILS = {
  // Music Commands
  play: {
    name: "play",
    aliases: ["p"],
    description: "Putar lagu dari YouTube, Spotify, SoundCloud, dll",
    usage: "/play <nama_lagu atau link>",
    example: "/play NCT Dream Beatbox\n/play https://youtube.com/...",
    permissions: "Harus di voice channel",
    category: "music"
  },
  playlist: {
    name: "playlist",
    aliases: ["pl"],
    description: "Kelola playlist musik personal",
    usage: "/playlist <create|delete|add|remove|list|play|share|public>",
    example: "/playlist create MyFavorite\n/playlist play MyFavorite",
    permissions: "Tidak ada",
    category: "music"
  },
  queue: {
    name: "queue",
    aliases: ["q"],
    description: "Tampilkan antrian lagu dengan pagination",
    usage: "/queue [halaman] [pencarian]",
    example: "/queue\n/queue 2\n/queue search NCT",
    permissions: "Harus di voice channel",
    category: "music"
  },
  nowplaying: {
    name: "nowplaying",
    aliases: ["np", "playing"],
    description: "Tampilkan lagu yang sedang diputar",
    usage: "/nowplaying",
    example: "/nowplaying",
    permissions: "Harus di voice channel",
    category: "music"
  },
  pause: {
    name: "pause",
    aliases: ["pa"],
    description: "Jeda lagu yang sedang diputar",
    usage: "/pause",
    example: "/pause",
    permissions: "Harus di voice channel",
    category: "music"
  },
  resume: {
    name: "resume",
    aliases: ["re"],
    description: "Lanjutkan lagu yang dijeda",
    usage: "/resume",
    example: "/resume",
    permissions: "Harus di voice channel",
    category: "music"
  },
  skip: {
    name: "skip",
    aliases: ["s", "next"],
    description: "Lewati lagu yang sedang diputar",
    usage: "/skip",
    example: "/skip",
    permissions: "Harus di voice channel",
    category: "music"
  },
  stop: {
    name: "stop",
    aliases: ["st"],
    description: "Hentikan pemutaran dan keluar dari voice",
    usage: "/stop",
    example: "/stop",
    permissions: "Harus di voice channel",
    category: "music"
  },
  volume: {
    name: "volume",
    aliases: ["vol", "v"],
    description: "Atur volume pemutaran (0-200%)",
    usage: "/volume <0-200>",
    example: "/volume 50\n/volume 100",
    permissions: "Harus di voice channel",
    category: "music"
  },
  shuffle: {
    name: "shuffle",
    aliases: ["sh"],
    description: "Kocok/acak urutan antrian lagu",
    usage: "/shuffle",
    example: "/shuffle",
    permissions: "Harus di voice channel + minimal 2 lagu",
    category: "music"
  },
  loop: {
    name: "loop",
    aliases: ["lp"],
    description: "Ulangi lagu atau antrian",
    usage: "/loop <off|track|queue>",
    example: "/loop track\n/loop queue",
    permissions: "Harus di voice channel",
    category: "music"
  },
  autoplay: {
    name: "autoplay",
    aliases: ["ap", "auto"],
    description: "Otomatis putar lagu serupa",
    usage: "/autoplay",
    example: "/autoplay",
    permissions: "Harus di voice channel",
    category: "music"
  },
  join: {
    name: "join",
    aliases: ["j", "connect"],
    description: "Bot masuk ke voice channel",
    usage: "/join",
    example: "/join",
    permissions: "Harus di voice channel",
    category: "music"
  },
  leave: {
    name: "leave",
    aliases: ["disconnect", "dc"],
    description: "Bot keluar dari voice channel",
    usage: "/leave",
    example: "/leave",
    permissions: "Harus di voice channel",
    category: "music"
  },
  filter: {
    name: "filter",
    aliases: ["f"],
    description: "Terapkan efek audio (bassboost, nightcore, dll)",
    usage: "/filter <bassboost|nightcore|vaporwave|tremolo|vibrato|rotation|distortion|lowpass|clear>",
    example: "/filter bassboost\n/filter nightcore\n/filter clear",
    permissions: "Harus di voice channel + lagu sedang diputar",
    category: "music"
  },
  lyrics: {
    name: "lyrics",
    aliases: ["ly"],
    description: "Tampilkan lirik lagu yang sedang diputar",
    usage: "/lyrics",
    example: "/lyrics",
    permissions: "Harus di voice channel + lagu sedang diputar",
    category: "music"
  },
  favorite: {
    name: "favorite",
    aliases: ["fav", "favorites"],
    description: "Kelola lagu favoritmu",
    usage: "/favorite <add|remove|list|play|clear>",
    example: "/favorite add\n/favorite list\n/favorite play",
    permissions: "Tidak ada",
    category: "music"
  },
  "247": {
    name: "247",
    aliases: ["24/7", "always-on"],
    description: "Bot tetap di voice channel 24/7",
    usage: "/247",
    example: "/247",
    permissions: "Harus di voice channel",
    category: "music"
  },
  // Information Commands
  ping: {
    name: "ping",
    aliases: ["latency"],
    description: "Cek latency/koneksi bot",
    usage: "/ping",
    example: "/ping",
    permissions: "Tidak ada",
    category: "info"
  },
  stats: {
    name: "stats",
    aliases: ["statistics", "botinfo"],
    description: "Tampilkan statistik bot",
    usage: "/stats",
    example: "/stats",
    permissions: "Tidak ada",
    category: "info"
  },
  about: {
    name: "about",
    aliases: ["info", "bot"],
    description: "Informasi tentang bot",
    usage: "/about",
    example: "/about",
    permissions: "Tidak ada",
    category: "info"
  },
  node: {
    name: "node",
    aliases: ["nodes", "lavalink"],
    description: "Status server Lavalink",
    usage: "/node",
    example: "/node",
    permissions: "Tidak ada",
    category: "info"
  },
  profile: {
    name: "profile",
    aliases: ["user", "me"],
    description: "Tampilkan profile musikmu",
    usage: "/profile",
    example: "/profile",
    permissions: "Tidak ada",
    category: "info"
  }
};

// Command categories
const CATEGORIES = {
  music: {
    name: "Music",
    emoji: "🎵",
    color: 0x8b5cf6,
    description: "Command untuk memutar dan mengelola musik",
    commands: ["play", "playlist", "queue", "nowplaying", "pause", "resume", "skip", "stop", "volume", "shuffle", "loop", "autoplay", "join", "leave", "filter", "lyrics", "favorite", "247"]
  },
  info: {
    name: "Information",
    emoji: "ℹ️",
    color: 0x06b6d4,
    description: "Command untuk informasi bot",
    commands: ["ping", "stats", "about", "node", "profile"]
  }
};

module.exports = {
  name: "help",
  description: "Menampilkan semua command yang tersedia",

  run: async (client, interaction) => {
    // Create select menu with all commands
    const selectOptions = [];
    
    for (const [name, details] of Object.entries(COMMAND_DETAILS)) {
      selectOptions.push({
        label: "/" + name,
        description: details.description.slice(0, 80),
        value: name
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_select")
      .setPlaceholder("Pilih command untuk melihat detail...")
      .addOptions(selectOptions);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    // Create main help container
    const mainContainer = createMainContainer();

    // Create category buttons
    const categoryButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("help_music")
          .setLabel("Music")
          .setEmoji("🎵")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("help_info")
          .setLabel("Info")
          .setEmoji("ℹ️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("help_all")
          .setLabel("All")
          .setEmoji("📚")
          .setStyle(ButtonStyle.Secondary)
      );

    // Create links buttons
    const linkButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setURL("https://github.com")
          .setLabel("GitHub")
          .setEmoji("📦")
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setURL("https://discord.gg/")
          .setLabel("Support")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setCustomId("help_tips")
          .setLabel("Tips")
          .setEmoji("💡")
          .setStyle(ButtonStyle.Success)
      );

    // Build components array
    const components = [mainContainer, selectRow, categoryButtons, linkButtons];

    // Send initial response
    await interaction.reply({
      components,
      flags: MessageFlags.IsComponentsV2
    });

    // Create interaction collector
    const collector = interaction.channel?.createMessageComponentCollector({
      time: 300000
    });

    if (!collector) return;

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "Ini bukan untukmu.", flags: 64 });
      }

      try {
        if (i.isStringSelectMenu()) {
          const selectedCmd = i.values[0];
          const cmdDetails = COMMAND_DETAILS[selectedCmd];
          
          if (cmdDetails) {
            const detailContainer = createDetailContainer(cmdDetails);
            await i.update({
              components: [detailContainer, selectRow, categoryButtons, linkButtons]
            });
          }
        }

        if (i.isButton()) {
          const customId = i.customId;

          if (customId === "help_music" || customId === "help_info" || customId === "help_all") {
            let categoryKey = customId.replace("help_", "");
            if (categoryKey === "all") {
              await i.update({ components });
            } else {
              const categoryContainer = createCategoryContainer(categoryKey);
              await i.update({
                components: [categoryContainer, selectRow, categoryButtons, linkButtons]
              });
            }
          } else if (customId === "help_tips") {
            const tipsContainer = createTipsContainer();
            await i.update({
              components: [tipsContainer, selectRow, categoryButtons, linkButtons]
            });
          }
        }
      } catch (error) {
        console.error("[Help] Collector error:", error);
      }
    });
  }
};

function createMainContainer() {
  const totalCommands = Object.keys(COMMAND_DETAILS).length;
  
  return new ContainerBuilder()
    .setAccentColor(0x8b5cf6)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("### Menu Help PPLGBot")
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Selamat datang di PPLGBot!\n\n" +
        "Bot musik Discord premium dengan fitur lengkap.\n\n" +
        "Total Command: " + totalCommands + "\n" +
        "Music: 18 commands\n" +
        "Info: 5 commands\n\n" +
        "Cara Menggunakan:\n" +
        "- Pilih command dari menu dropdown\n" +
        "- Klik tombol kategori untuk melihat command\n" +
        "- Setiap command memiliki contoh penggunaan"
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Quick Start:\n" +
        "/play <lagu> - Mainkan lagu favorit\n" +
        "/queue - Lihat antrian lagu\n" +
        "/filter bassboost - Tingkatkan bass\n" +
        "/247 - Stay di voice channel 24/7"
      )
    );
}

function createDetailContainer(details) {
  const category = CATEGORIES[details.category];
  
  return new ContainerBuilder()
    .setAccentColor(category?.color || 0x8b5cf6)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("Command: /" + details.name)
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Deskripsi: " + details.description + "\n\n" +
        "Usage: " + details.usage + "\n\n" +
        "Example: " + details.example + "\n\n" +
        "Permissions: " + details.permissions
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Aliases: " + details.aliases.map(a => "/"+a).join(", ")
      )
    );
}

function createCategoryContainer(category) {
  const cat = CATEGORIES[category];
  if (!cat) return createMainContainer();

  const cmdList = cat.commands.map(name => {
    const cmd = COMMAND_DETAILS[name];
    return cmd ? "/"+cmd.name + " - " + cmd.description : null;
  }).filter(Boolean).join("\n");

  return new ContainerBuilder()
    .setAccentColor(cat.color)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(cat.emoji + " " + cat.name)
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        cat.description + "\n\n" + cmdList
      )
    );
}

function createTipsContainer() {
  return new ContainerBuilder()
    .setAccentColor(0x22c55e)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("Tips & Tricks PPLGBot")
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Music Tips:\n" +
        "- Gunakan link YouTube/Spotify langsung untuk hasil terbaik\n" +
        "- Filter bassboost + nightcore = efek unik\n" +
        "- Loop queue untuk party mode\n" +
        "- Buat playlist untuk kumpulan lagu favorit\n\n" +
        
        "Button Controls:\n" +
        "- Pause/Resume untuk jeda/lanjut\n" +
        "- Skip untuk next track\n" +
        "- Queue untuk lihat semua lagu\n" +
        "- Loop untuk ulang track/queue\n\n" +
        
        "Pro Tips:\n" +
        "- /247agar bot tidak keluar saat idle\n" +
        "- /autoplay untuk rekomendasi lagu otomatis\n" +
        "- /favorite untuk simpan lagu kesukaan"
      )
    );
}

/**
 * PPLGBot - Help Command v2.0
 * Modern dark theme dengan Interactivity
 */

