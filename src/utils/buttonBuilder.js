/**
 * PPLGBot - Utility: Button Builder
 * Membuat button dengan customId unik untuk music commands
 */

const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");

// Style warna button
const ButtonStyles = {
    primary: ButtonStyle.Primary,
    secondary: ButtonStyle.Secondary,
    success: ButtonStyle.Success,
    danger: ButtonStyle.Danger,
    link: ButtonStyle.Link
};

// Emoji yang konsisten
const Emojis = {
    play: "▶️",
    pause: "⏸️",
    stop: "⏹️",
    skip: "⏭️",
    previous: "⏮️",
    shuffle: "🔀",
    repeat: "🔁",
    repeatOne: "🔂",
    queue: "📋",
    volumeUp: "🔊",
    volumeDown: "🔉",
    mute: "🔇",
    autoplay: "♾️",
    filter: "🎛️",
    info: "ℹ️",
    loading: "⏳",
    check: "✅",
    cross: "❌",
    left: "◀️",
    right: "▶️"
};

/**
 * Generate customId unik untuk button
 * @param {string} command - Nama command
 * @param {string} action - Aksi button
 * @param {string} guildId - ID guild
 */
function generateCustomId(command, action, guildId) {
    return `${command}_${action}_${guildId}_${Date.now()}`;
}

/**
 * Button untuk now playing (play/pause, skip, stop, dll)
 */
function nowPlayingButtons(player, guildId) {
    const isPaused = player.paused;
    const hasNext = player.queue.length > 0;
    
    return new ActionRowBuilder()
        .addComponents(
            // Play/Pause button
            new ButtonBuilder()
                .setCustomId(`music_pause_${guildId}`)
                .setEmoji(isPaused ? Emojis.play : Emojis.pause)
                .setStyle(isPaused ? ButtonStyles.success : ButtonStyles.primary)
                .setDisabled(!player.current),
            
            // Stop button
            new ButtonBuilder()
                .setCustomId(`music_stop_${guildId}`)
                .setEmoji(Emojis.stop)
                .setStyle(ButtonStyles.danger)
                .setDisabled(!player.current),
            
            // Skip button
            new ButtonBuilder()
                .setCustomId(`music_skip_${guildId}`)
                .setEmoji(Emojis.skip)
                .setStyle(ButtonStyles.primary)
                .setDisabled(!hasNext),
            
            // Queue button
            new ButtonBuilder()
                .setCustomId(`music_queue_${guildId}`)
                .setEmoji(Emojis.queue)
                .setStyle(ButtonStyles.secondary),
            
            // Autoplay button
            new ButtonBuilder()
                .setCustomId(`music_autoplay_${guildId}`)
                .setEmoji(Emojis.autoplay)
                .setStyle(player.isAutoplay ? ButtonStyles.success : ButtonStyles.secondary)
        );
}

/**
 * Button untuk queue pagination
 */
function queuePaginationButtons(guildId, currentPage, totalPages) {
    return new ActionRowBuilder()
        .addComponents(
            // Previous page
            new ButtonBuilder()
                .setCustomId(`queue_prev_${guildId}_${currentPage}`)
                .setEmoji(Emojis.left)
                .setStyle(ButtonStyles.primary)
                .setDisabled(currentPage === 0),
            
            // Page indicator
            new ButtonBuilder()
                .setCustomId(`queue_page_${guildId}`)
                .setLabel(`${currentPage + 1}/${totalPages}`)
                .setStyle(ButtonStyles.secondary)
                .setDisabled(true),
            
            // Next page
            new ButtonBuilder()
                .setCustomId(`queue_next_${guildId}_${currentPage}`)
                .setEmoji(Emojis.right)
                .setStyle(ButtonStyles.primary)
                .setDisabled(currentPage >= totalPages - 1),
            
            // Shuffle button
            new ButtonBuilder()
                .setCustomId(`queue_shuffle_${guildId}`)
                .setEmoji(Emojis.shuffle)
                .setStyle(ButtonStyles.secondary),
            
            // Clear queue button
            new ButtonBuilder()
                .setCustomId(`queue_clear_${guildId}`)
                .setEmoji(Emojis.cross)
                .setStyle(ButtonStyles.danger)
        );
}

/**
 * Button untuk volume control
 */
function volumeButtons(guildId, currentVolume) {
    return new ActionRowBuilder()
        .addComponents(
            // Volume Down
            new ButtonBuilder()
                .setCustomId(`volume_down_${guildId}`)
                .setEmoji(Emojis.volumeDown)
                .setStyle(ButtonStyles.secondary)
                .setDisabled(currentVolume <= 0),
            
            // Mute
            new ButtonBuilder()
                .setCustomId(`volume_mute_${guildId}`)
                .setEmoji(Emojis.mute)
                .setStyle(ButtonStyles.secondary),
            
            // Volume indicator
            new ButtonBuilder()
                .setCustomId(`volume_indicator_${guildId}`)
                .setLabel(`${currentVolume}%`)
                .setStyle(ButtonStyles.primary)
                .setDisabled(true),
            
            // Volume Up
            new ButtonBuilder()
                .setCustomId(`volume_up_${guildId}`)
                .setEmoji(Emojis.volumeUp)
                .setStyle(ButtonStyles.secondary)
                .setDisabled(currentVolume >= 200),
            
            // Max volume
            new ButtonBuilder()
                .setCustomId(`volume_max_${guildId}`)
                .setEmoji("💯")
                .setStyle(ButtonStyles.primary)
                .setDisabled(currentVolume >= 200)
        );
}

/**
 * Button untuk loop mode
 */
function loopButtons(guildId, loopMode) {
    // loopMode: 'off', 'track', 'queue'
    return new ActionRowBuilder()
        .addComponents(
            // Loop off
            new ButtonBuilder()
                .setCustomId(`loop_off_${guildId}`)
                .setEmoji("⏺️")
                .setStyle(loopMode === 'off' ? ButtonStyles.success : ButtonStyles.secondary),
            
            // Loop track
            new ButtonBuilder()
                .setCustomId(`loop_track_${guildId}`)
                .setEmoji(Emojis.repeatOne)
                .setStyle(loopMode === 'track' ? ButtonStyles.success : ButtonStyles.secondary),
            
            // Loop queue
            new ButtonBuilder()
                .setCustomId(`loop_queue_${guildId}`)
                .setEmoji(Emojis.repeat)
                .setStyle(loopMode === 'queue' ? ButtonStyles.success : ButtonStyles.secondary)
        );
}

/**
 * Button untuk filter (bassboost, nightcore, vaporwave)
 */
function filterButtons(guildId, activeFilters = {}) {
    return new ActionRowBuilder()
        .addComponents(
            // Bassboost
            new ButtonBuilder()
                .setCustomId(`filter_bassboost_${guildId}`)
                .setEmoji("🎸")
                .setLabel("Bassboost")
                .setStyle(activeFilters.bassboost ? ButtonStyles.success : ButtonStyles.secondary),
            
            // Nightcore
            new ButtonBuilder()
                .setCustomId(`filter_nightcore_${guildId}`)
                .setEmoji("🌙")
                .setLabel("Nightcore")
                .setStyle(activeFilters.nightcore ? ButtonStyles.success : ButtonStyles.secondary),
            
            // Vaporwave
            new ButtonBuilder()
                .setCustomId(`filter_vaporwave_${guildId}`)
                .setEmoji("🌊")
                .setLabel("Vaporwave")
                .setStyle(activeFilters.vaporwave ? ButtonStyles.success : ButtonStyles.secondary),
            
            // Clear filters
            new ButtonBuilder()
                .setCustomId(`filter_clear_${guildId}`)
                .setEmoji(Emojis.cross)
                .setLabel("Clear")
                .setStyle(ButtonStyles.danger)
        );
}

/**
 * Button untuk play command (setelah search)
 */
function playSearchButtons(guildId, trackIndex) {
    return new ActionRowBuilder()
        .addComponents(
            // Play this
            new ButtonBuilder()
                .setCustomId(`play_search_${guildId}_${trackIndex}`)
                .setEmoji(Emojis.play)
                .setLabel("Putar Ini")
                .setStyle(ButtonStyles.success),
            
            // Add to queue
            new ButtonBuilder()
                .setCustomId(`play_queue_${guildId}_${trackIndex}`)
                .setEmoji("➕")
                .setLabel("Tambah ke Antrian")
                .setStyle(ButtonStyles.primary),
            
            // Cancel
            new ButtonBuilder()
                .setCustomId(`play_cancel_${guildId}`)
                .setEmoji(Emojis.cross)
                .setLabel("Batal")
                .setStyle(ButtonStyles.danger)
        );
}

/**
 * Button untuk leave command
 */
function leaveButtons(guildId) {
    return new ActionRowBuilder()
        .addComponents(
            // Confirm leave
            new ButtonBuilder()
                .setCustomId(`leave_confirm_${guildId}`)
                .setEmoji(Emojis.check)
                .setLabel("Keluar")
                .setStyle(ButtonStyles.danger),
            
            // Cancel
            new ButtonBuilder()
                .setCustomId(`leave_cancel_${guildId}`)
                .setEmoji(Emojis.cross)
                .setLabel("Batal")
                .setStyle(ButtonStyles.secondary)
        );
}

/**
 * Disable semua button dalam action row
 * @param {ActionRowBuilder} actionRow - Action row yang akan di-disable
 */
function disableAllButtons(actionRow) {
    actionRow.components.forEach(button => {
        button.setDisabled(true);
    });
    return actionRow;
}

module.exports = {
    ButtonStyles,
    Emojis,
    generateCustomId,
    nowPlayingButtons,
    queuePaginationButtons,
    volumeButtons,
    loopButtons,
    filterButtons,
    playSearchButtons,
    leaveButtons,
    disableAllButtons
};

