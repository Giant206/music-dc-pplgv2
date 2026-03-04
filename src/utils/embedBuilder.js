/**
 * PPLGBot - Utility: Embed Builder
 * Membuat embed dengan tema dark mode yang konsisten
 */

const {
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

// Tema warna dark mode
const Colors = {
    primary: 0x0f172a,      // #0f172a - Dark slate
    secondary: 0x1e293b,    // #1e293b - Slate 800
    accent: 0x38bdf8,        // #38bdf8 - Sky blue
    success: 0x22c55e,       // #22c55e - Green
    error: 0xef4444,         // #ef4444 - Red
    warning: 0xf59e0b,       // #f59e0b - Amber
    info: 0x3b82f6          // #3b82f6 - Blue
};

// Footer default
const FOOTER = "PPLGBot X GBinoo";

/**
 * Buat embed error
 * @param {string} title - Judul embed
 * @param {string} description - Deskripsi error
 * @param {object} options - Opsi tambahan
 */
function errorEmbed(title, description, options = {}) {
    return new ContainerBuilder()
        .setAccentColor(options.color || Colors.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ❌ ${title}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
        );
}

/**
 * Buat embed success
 * @param {string} title - Judul embed
 * @param {string} description - Deskripsi success
 * @param {object} options - Opsi tambahan
 */
function successEmbed(title, description, options = {}) {
    return new ContainerBuilder()
        .setAccentColor(options.color || Colors.success)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ✅ ${title}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
        );
}

/**
 * Buat embed info
 * @param {string} title - Judul embed
 * @param {string} description - Deskripsi info
 * @param {object} options - Opsi tambahan
 */
function infoEmbed(title, description, options = {}) {
    return new ContainerBuilder()
        .setAccentColor(options.color || Colors.accent)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ℹ️ ${title}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
        );
}

/**
 * Buat embed warning
 * @param {string} title - Judul embed
 * @param {string} description - Deskripsi warning
 * @param {object} options - Opsi tambahan
 */
function warningEmbed(title, description, options = {}) {
    return new ContainerBuilder()
        .setAccentColor(options.color || Colors.warning)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ⚠️ ${title}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
        );
}

/**
 * Buat embed musik sekarang sedang diputar
 * @param {object} track - Track yang sedang diputar
 * @param {number} currentTime - Posisi sekarang dalam ms
 * @param {object} options - Opsi tambahan
 */
function nowPlayingEmbed(track, currentTime, options = {}) {
    const { progressBar, requester } = options;
    const thumbnail = track.info.thumbnail || "https://i.imgur.com/AfFp7pu.png";
    
    return new ContainerBuilder()
        .setAccentColor(Colors.accent)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 🎵 Sedang Diputar")
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
                        `${progressBar || "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬"}\n\n` +
                        `Requested by ${requester?.username || "Unknown"}`
                    )
                )
        );
}

/**
 * Buat embed untuk queue
 * @param {object} player - Player object
 * @param {object} options - Opsi tambahan
 */
function queueEmbed(player, options = {}) {
    const { page = 0, perPage = 10 } = options;
    const queue = player.queue;
    const current = player.current;
    
    if (!current) {
        return errorEmbed("Tidak Ada Musik", "Tidak ada musik yang diputar saat ini.");
    }

    const startIndex = page * perPage;
    const endIndex = startIndex + perPage;
    const queuePage = queue.slice(startIndex, endIndex);
    
    const nowPlayingText =
        `**[${current.info.title}](${current.info.uri})**\n` +
        `Duration: ${formatTime(current.info.length)}\n\n` +
        `Queue Length: ${queue.length} tracks`;

    let upNextText = "";
    if (queuePage.length) {
        upNextText = queuePage
            .map((track, index) => `${startIndex + index + 1}. [${track.info.title}](${track.info.uri})`)
            .join("\n");
    } else {
        upNextText = "Tidak ada lagu dalam antrian.";
    }

    const container = new ContainerBuilder()
        .setAccentColor(Colors.accent)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 📋 Antrian Lagu")
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("**Sedang Diputar:**\n" + nowPlayingText)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("**Selanjutnya:**\n" + upNextText)
        );

    if (current.info.thumbnail) {
        container.setThumbnail(current.info.thumbnail);
    }

    return container;
}

/**
 * Format waktu dari milliseconds
 * @param {number} ms - Waktu dalam milliseconds
 */
function formatTime(ms) {
    if (!ms || ms === 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
}

module.exports = {
    Colors,
    FOOTER,
    errorEmbed,
    successEmbed,
    infoEmbed,
    warningEmbed,
    nowPlayingEmbed,
    queueEmbed,
    formatTime
};

