/**
 * PPLGBot - Configuration
 * Pengaturan utama bot Discord musik
 */

module.exports = {
    // ============================================
    // 🔐 BOT IDENTIFICATION
    // ============================================
    clientid: "", // Client ID dari Discord Developer Portal

    // 🎨 APPEARANCE
    // ============================================
    color: 0x38bdf8, // Warna utama (Sky blue)
    color2: 0x0f172a, // Warna sekunder (Dark slate)
    footer: "PPLGBot X GBinoo", // Footer teks
    
    // ============================================
    // 🔧 PREFIX & ENGINE
    // ============================================
    prefix: "!", // Prefix untuk text commands (tidak wajib digunakan)
    engine: "ytsearch", // Platform pencarian: ytsearch, spotify, soundcloud, deezer, applemusic
    
    // ============================================
    // 👑 OWNER SETTINGS
    // ============================================
    developers: [1186985440759267351], // Array ID user yang bisa akses developer commands
    owners: [1186985440759267351], // Array ID user yang punya akses penuh ke bot
    
    // ============================================
    // 🎵 LAVALINK NODES
    // ============================================
    nodes: [
        {
            name: "nexa-1", // Nama node
            host: "lava-v4.millohost.my.id", // Host Lavalink server
            password: "https://discord.gg/mjS5J2K3ep", // Password Lavalink
            port: 443, // Port Lavalink
            secure: true, // Gunakan HTTPS
        },
    ],
    
    // ============================================
    // 🎤 LYRICS SETTINGS
    // ============================================
    geniusToken: process.env.GENIUS_TOKEN || "", // Token Genius untuk lyrics command (opsional)
    
    // ============================================
    // ⚙️ DEVELOPMENT MODE
    // ============================================
    devMode: false, // Jika true, commands hanya register ke dev guild
    devGuildId: "1478292959123210333", // Guild ID untuk development mode
    
    // ============================================
    // 🎛️ MUSIC SETTINGS
    // ============================================
    maxQueueLength: 1000, // Maksimal lagu dalam queue
    defaultVolume: 100, // Volume default (0-100)
    
    // ============================================
    // ⏰ AUTO DISCONNECT
    // ============================================
    autoDisconnectTimeout: 60000, // Timeout disconnect dalam ms (default 1 menit)

    // ============================================
    // 🗄️ MONGODB SETTINGS
    // ============================================
    mongoUri: process.env.MONGODB_URI || "mongodb+srv://giantest:giantest@giandatabase.60zyiyh.mongodb.net/", // MongoDB connection string (use env var for security)
    mongoDatabase: "PPLGBot", // Nama database
};

/**
 * ========================================
 * PPLGBot X GBinoo
 * Sistem Musik Modern
 * ========================================
 * 
 * Cara Penggunaan:
 * 1. Ganti clientid dengan Client ID bot kamu
 * 2. Tambahkan developer/owner IDs
 * 3. Konfigurasi Lavalink nodes
 * 4. Jalankan: node src/index.js
 * 
 * Dukungan: Join server discord.gg/
 * ========================================
 */

