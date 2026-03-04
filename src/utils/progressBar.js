/**
 * PPLGBot - Utility: Progress Bar
 * Membuat progress bar untuk lagu yang sedang diputar
 */

/**
 * Format milliseconds ke waktu string
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

/**
 * Format milliseconds ke waktu string dengan label
 * @param {number} ms - Waktu dalam milliseconds
 */
function formatTimeFull(ms) {
    if (!ms || ms === 0) return "0 menit";
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = [];
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && hours === 0) result.push(`${seconds} detik`);

    return result.join(" ");
}

/**
 * Buat progress bar untuk lagu
 * @param {number} current - Posisi sekarang dalam ms
 * @param {number} total - Total waktu dalam ms
 * @param {number} size - Panjang progress bar (default: 18)
 */
function createProgressBar(current, total, size = 18) {
    // Handle live streams
    if (total === 0 || !total) {
        return "🔴 LIVE";
    }
    
    // Calculate percentage
    const percent = current / total;
    
    // Ensure percent is between 0 and 1
    const clampedPercent = Math.max(0, Math.min(1, percent));
    
    // Calculate progress position
    const progress = Math.round(size * clampedPercent);
    
    // Create progress bar with custom emojis
    const filled = "▰".repeat(progress);
    const empty = "▱".repeat(size - progress);
    
    return filled + "🔘" + empty;
}

/**
 * Buat progress bar simple (tanpa emoji)
 * @param {number} current - Posisi sekarang dalam ms
 * @param {number} total - Total waktu dalam ms
 * @param {number} size - Panjang progress bar (default: 15)
 */
function createSimpleProgressBar(current, total, size = 15) {
    // Handle live streams
    if (total === 0 || !total) {
        return "LIVE";
    }
    
    const percent = total === 0 ? 0 : current / total;
    const progress = Math.round(size * Math.max(0, Math.min(1, percent)));
    
    return "▬".repeat(progress) + "●" + "▬".repeat(size - progress);
}

/**
 * Buat progress bar dengan persentase
 * @param {number} current - Posisi sekarang dalam ms
 * @param {number} total - Total waktu dalam ms
 * @param {number} size - Panjang progress bar (default: 12)
 */
function createPercentProgressBar(current, total, size = 12) {
    // Handle live streams
    if (total === 0 || !total) {
        return { bar: "🔴 LIVE", percent: 100 };
    }
    
    const percent = Math.round((current / total) * 100);
    const progress = Math.round(size * Math.max(0, Math.min(1, percent / 100)));
    
    const bar = "█".repeat(progress) + "░".repeat(size - progress);
    
    return { bar, percent };
}

/**
 * Parse input progress bar (untuk user yang klik)
 * @param {string} progressBarString - String progress bar
 * @returns {number} - Persentase (0-100)
 */
function parseProgressBar(progressBarString) {
    if (progressBarString === "LIVE") return 100;
    
    // Hitung persentase dari karakter
    const filled = (progressBarString.match(/▰|█|▬/g) || []).length;
    const total = progressBarString.length;
    
    return Math.round((filled / total) * 100);
}

/**
 * Hitung posisi dalam ms dari persentase
 * @param {number} percent - Persentase (0-100)
 * @param {number} total - Total waktu dalam ms
 */
function getPositionFromPercent(percent, total) {
    return Math.floor((percent / 100) * total);
}

/**
 * Format durasi untuk queue display
 * @param {number} ms - Waktu dalam milliseconds
 */
function formatDuration(ms) {
    if (!ms || ms === 0) return "0:00";
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Hitung total durasi queue
 * @param {Array} queue - Array dari track objects
 */
function calculateTotalQueueDuration(queue) {
    if (!queue || queue.length === 0) return 0;
    
    const total = queue.reduce((acc, track) => {
        return acc + (track.info.length || 0);
    }, 0);
    
    return formatDuration(total);
}

/**
 * Format timestamp untuk embed
 * @param {Date} date - Tanggal
 */
function formatTimestamp(date = new Date()) {
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

/**
 * Format relative time (misal: "5 menit yang lalu")
 * @param {number} timestamp - Timestamp dalam ms
 */
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    if (minutes > 0) return `${minutes} menit yang lalu`;
    return `${seconds} detik yang lalu`;
}

module.exports = {
    formatTime,
    formatTimeFull,
    createProgressBar,
    createSimpleProgressBar,
    createPercentProgressBar,
    parseProgressBar,
    getPositionFromPercent,
    formatDuration,
    calculateTotalQueueDuration,
    formatTimestamp,
    formatRelativeTime
};

