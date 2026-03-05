/**
 * PPLGBot - Database: MongoDB
 * Menggunakan MongoDB untuk menyimpan profile, stats, dan 247 mode
 */

const mongoose = require("mongoose");

// ============================================
// MONGODB SCHEMAS
// ============================================

// User Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, default: "Unknown" },
  bio: { type: String, default: "" },
  favoriteGenre: { type: String, default: "" },
  totalCommands: { type: Number, default: 0 },
  totalListening: { type: Number, default: 0 }, // in seconds
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 247 Mode Schema
const mode247Schema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  voiceChannelId: { type: String, default: null },
  textChannelId: { type: String, default: null },
  volume: { type: Number, default: 100 },
  autoplay: { type: Boolean, default: false },
  loop: { type: String, default: "off" },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now }
});

// Server Stats Schema
const serverStatsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  totalListening: { type: Number, default: 0 },
  totalTracksPlayed: { type: Number, default: 0 },
  voiceChannelId: { type: String, default: null },
  currentListeners: [{
    userId: String,
    username: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  topListeners: [{
    userId: String,
    username: String,
    listeningTime: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Global Stats Schema
const globalStatsSchema = new mongoose.Schema({
  _id: { type: String, default: "global" },
  totalListening: { type: Number, default: 0 },
  totalTracksPlayed: { type: Number, default: 0 },
  topTracks: [{
    title: String,
    artist: String,
    thumbnail: String,
    plays: { type: Number, default: 1 }
  }],
  topArtists: [{
    name: String,
    plays: { type: Number, default: 1 }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

// ============================================
// MONGODB MODELS
// ============================================

let Profile, Mode247, ServerStats, GlobalStats;
let isConnected = false;
let dbInitialized = false;

/**
 * Connect to MongoDB
 */
async function connectMongoDB(config) {
  try {
    const mongoUri = config.mongoUri || process.env.MONGODB_URI;
    const mongoDbName = config.mongoDatabase || "PPLGBot";
    
    if (!mongoUri || mongoUri.includes("<db_username>")) {
      console.error("[DATABASE] ❌ MongoDB URI not configured!");
      return false;
    }

    await mongoose.connect(mongoUri, {
      dbName: mongoDbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Initialize models
    Profile = mongoose.model("Profile", profileSchema);
    Mode247 = mongoose.model("Mode247", mode247Schema);
    ServerStats = mongoose.model("ServerStats", serverStatsSchema);
    GlobalStats = mongoose.model("GlobalStats", globalStatsSchema);

    isConnected = true;
    console.log(`[DATABASE] ✅ Connected to MongoDB: ${mongoDbName}`);
    return true;
  } catch (err) {
    console.error(`[DATABASE] ❌ MongoDB connection failed: ${err.message}`);
    isConnected = false;
    return false;
  }
}

/**
 * Initialize database with retry logic
 */
async function initDatabase(config, maxRetries = 3, retryDelay = 5000) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[DATABASE] Attempting MongoDB connection (${attempt}/${maxRetries})...`);
    
    const mongoConnected = await connectMongoDB(config);
    
    if (mongoConnected) {
      console.log("[DATABASE] ✅ MongoDB connection successful!");
      
      // Migrate JSON data if exists
      await migrateJsonToMongo();
      
      dbInitialized = true;
      return true;
    }
    
    lastError = "Connection failed";
    console.log(`[DATABASE] ⚠️ Attempt ${attempt} failed, retrying in ${retryDelay/1000}s...`);
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.error("[DATABASE] ❌ All MongoDB connection attempts failed!");
  console.error("[DATABASE] Please check:");
  console.error("   1. MongoDB Atlas cluster is running (not paused)");
  console.error("   2. IP address is whitelisted in MongoDB Atlas");
  console.error("   3. Connection string is correct in config.js");
  console.error("");
  console.error("[DATABASE] ❌ Bot cannot start without MongoDB!");
  console.error("[DATABASE] Exiting...");
  
  process.exit(1);
}

/**
 * Migrate JSON data to MongoDB
 */
async function migrateJsonToMongo() {
  const fs = require("fs");
  const path = require("path");
  
  const dataPath = path.join(__dirname, "../../data");
  
  try {
    // Migrate profiles
    const profilesFile = path.join(dataPath, "profiles.json");
    if (fs.existsSync(profilesFile)) {
      const profilesData = JSON.parse(fs.readFileSync(profilesFile, "utf8"));
      for (const [userId, data] of Object.entries(profilesData)) {
        await Profile.findOneAndUpdate(
          { userId },
          { ...data, updatedAt: Date.now() },
          { upsert: true }
        );
      }
      console.log(`[DATABASE] ✅ Migrated ${Object.keys(profilesData).length} profiles to MongoDB`);
    }
    
    // Migrate 247 mode
    const mode247File = path.join(dataPath, "247.json");
    if (fs.existsSync(mode247File)) {
      const mode247Data = JSON.parse(fs.readFileSync(mode247File, "utf8"));
      for (const [guildId, data] of Object.entries(mode247Data)) {
        await Mode247.findOneAndUpdate(
          { guildId },
          { ...data, lastUsed: Date.now() },
          { upsert: true }
        );
      }
      console.log(`[DATABASE] ✅ Migrated ${Object.keys(mode247Data).length} 247 settings to MongoDB`);
    }
    
    // Migrate stats
    const statsFile = path.join(dataPath, "stats.json");
    if (fs.existsSync(statsFile)) {
      const statsData = JSON.parse(fs.readFileSync(statsFile, "utf8"));
      if (statsData.global) {
        await GlobalStats.findOneAndUpdate(
          { _id: "global" },
          { ...statsData.global, lastUpdated: Date.now() },
          { upsert: true }
        );
      }
      console.log(`[DATABASE] ✅ Migrated stats to MongoDB`);
    }
    
    console.log("[DATABASE] ✅ Migration completed!");
  } catch (err) {
    console.error("[DATABASE] Migration error:", err.message);
  }
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Get user profile
 */
async function getProfile(userId) {
  if (!isConnected) {
    console.error("[DATABASE] MongoDB not connected!");
    return null;
  }
  
  try {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId, username: "Unknown" });
      await profile.save();
    }
    return profile;
  } catch (err) {
    console.error("[DATABASE] Error getProfile:", err.message);
    return null;
  }
}

/**
 * Save user profile
 */
async function saveProfile(userId, profileData) {
  if (!isConnected) {
    console.error("[DATABASE] MongoDB not connected!");
    return null;
  }
  
  try {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }
    
    Object.assign(profile, profileData, { userId, updatedAt: Date.now() });
    await profile.save();
    return profile;
  } catch (err) {
    console.error("[DATABASE] Error saveProfile:", err.message);
    return null;
  }
}

/**
 * Increment user command count
 */
async function incrementCommandCount(userId) {
  if (!isConnected) return;
  
  try {
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $inc: { totalCommands: 1 },
        $set: { updatedAt: Date.now() }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[DATABASE] Error incrementCommandCount:", err.message);
  }
}

/**
 * Add listening time (in seconds)
 */
async function addListeningTime(userId, seconds) {
  if (!isConnected) return;
  
  try {
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $inc: { totalListening: seconds },
        $set: { updatedAt: Date.now() }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[DATABASE] Error addListeningTime:", err.message);
  }
}

// ============================================
// 247 MODE FUNCTIONS
// ============================================

/**
 * Get 247 mode for guild
 */
async function get247Mode(guildId) {
  if (!isConnected) {
    return {
      enabled: false,
      voiceChannelId: null,
      textChannelId: null,
      volume: 100,
      autoplay: false,
      loop: "off"
    };
  }
  
  try {
    const mode = await Mode247.findOne({ guildId });
    if (mode) return mode;
    return {
      enabled: false,
      voiceChannelId: null,
      textChannelId: null,
      volume: 100,
      autoplay: false,
      loop: "off"
    };
  } catch (err) {
    console.error("[DATABASE] Error get247Mode:", err.message);
    return null;
  }
}

/**
 * Set 247 mode for guild
 */
async function set247Mode(guildId, settings) {
  if (!isConnected) return null;
  
  try {
    let mode = await Mode247.findOne({ guildId });
    if (!mode) {
      mode = new Mode247({ guildId });
    }
    
    Object.assign(mode, settings, { lastUsed: Date.now() });
    if (!mode.createdAt) mode.createdAt = Date.now();
    
    await mode.save();
    return mode;
  } catch (err) {
    console.error("[DATABASE] Error set247Mode:", err.message);
    return null;
  }
}

/**
 * Toggle 247 mode
 */
async function toggle247Mode(guildId, voiceChannelId, textChannelId) {
  const current = await get247Mode(guildId);
  
  if (current.enabled) {
    return set247Mode(guildId, { enabled: false });
  } else {
    return set247Mode(guildId, {
      enabled: true,
      voiceChannelId,
      textChannelId
    });
  }
}

/**
 * Remove 247 mode
 */
async function remove247Mode(guildId) {
  if (!isConnected) return;
  
  try {
    await Mode247.findOneAndDelete({ guildId });
  } catch (err) {
    console.error("[DATABASE] Error remove247Mode:", err.message);
  }
}

/**
 * Get all 247 enabled guilds
 */
async function getAll247Guilds() {
  if (!isConnected) return [];
  
  try {
    const modes = await Mode247.find({ enabled: true });
    return modes.map(m => ({ guildId: m.guildId, ...m.toObject() }));
  } catch (err) {
    console.error("[DATABASE] Error getAll247Guilds:", err.message);
    return [];
  }
}

// ============================================
// STATS FUNCTIONS
// ============================================

/**
 * Get global stats
 */
async function getStats() {
  if (!isConnected) {
    return { totalListening: 0, totalTracksPlayed: 0, topTracks: [], topArtists: [] };
  }
  
  try {
    let stats = await GlobalStats.findById("global");
    if (!stats) {
      stats = new GlobalStats({ _id: "global" });
      await stats.save();
    }
    return stats;
  } catch (err) {
    console.error("[DATABASE] Error getStats:", err.message);
    return null;
  }
}

/**
 * Increment tracks played
 */
async function incrementTracksPlayed(trackInfo) {
  if (!isConnected) return;
  
  try {
    const stats = await GlobalStats.findById("global");
    if (!stats) return;

    stats.totalTracksPlayed = (stats.totalTracksPlayed || 0) + 1;

    // Update top tracks
    const existingTrack = stats.topTracks.find(t => t.title === trackInfo.title && t.artist === trackInfo.author);
    if (existingTrack) {
      existingTrack.plays++;
    } else {
      stats.topTracks.push({
        title: trackInfo.title,
        artist: trackInfo.author,
        thumbnail: trackInfo.thumbnail,
        plays: 1
      });
    }

    // Keep only top 10
    stats.topTracks.sort((a, b) => b.plays - a.plays);
    stats.topTracks = stats.topTracks.slice(0, 10);

    // Update top artists
    const existingArtist = stats.topArtists.find(a => a.name === trackInfo.author);
    if (existingArtist) {
      existingArtist.plays++;
    } else {
      stats.topArtists.push({
        name: trackInfo.author,
        plays: 1
      });
    }

    stats.topArtists.sort((a, b) => b.plays - a.plays);
    stats.topArtists = stats.topArtists.slice(0, 10);

    stats.lastUpdated = Date.now();
    await stats.save();
  } catch (err) {
    console.error("[DATABASE] Error incrementTracksPlayed:", err.message);
  }
}

/**
 * Add global listening time
 */
async function addGlobalListeningTime(seconds) {
  if (!isConnected) return;
  
  try {
    await GlobalStats.findByIdAndUpdate(
      "global",
      { $inc: { totalListening: seconds }, $set: { lastUpdated: Date.now() } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[DATABASE] Error addGlobalListeningTime:", err.message);
  }
}

/**
 * Get server stats
 */
async function getServerStats(guildId) {
  if (!isConnected) {
    return { guildId, totalListening: 0, totalTracksPlayed: 0, currentListeners: [], topListeners: [] };
  }
  
  try {
    let stats = await ServerStats.findOne({ guildId });
    if (!stats) {
      stats = new ServerStats({ guildId });
      await stats.save();
    }
    return stats;
  } catch (err) {
    console.error("[DATABASE] Error getServerStats:", err.message);
    return null;
  }
}

/**
 * Save server stats
 */
async function saveServerStats(guildId, serverData) {
  if (!isConnected) return;
  
  try {
    await ServerStats.findOneAndUpdate(
      { guildId },
      { ...serverData, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[DATABASE] Error saveServerStats:", err.message);
  }
}

/**
 * Update voice listeners
 */
async function updateVoiceListeners(guildId, voiceChannelId, listeners) {
  if (!isConnected) return;
  
  try {
    let serverStats = await ServerStats.findOne({ guildId });
    if (!serverStats) {
      serverStats = new ServerStats({ guildId });
    }

    serverStats.voiceChannelId = voiceChannelId;
    serverStats.currentListeners = listeners.map(l => ({
      userId: l.userId,
      username: l.username,
      joinedAt: Date.now()
    }));

    // Add new listeners to topListeners if not exists
    for (const listener of listeners) {
      const existing = serverStats.topListeners.find(l => l.userId === listener.userId);
      if (!existing) {
        serverStats.topListeners.push({
          userId: listener.userId,
          username: listener.username,
          listeningTime: 0
        });
      }
    }

    serverStats.updatedAt = Date.now();
    await serverStats.save();
  } catch (err) {
    console.error("[DATABASE] Error updateVoiceListeners:", err.message);
  }
}

/**
 * Add user server listening time
 */
async function addUserServerListeningTime(guildId, userId, seconds) {
  if (!isConnected) return;
  
  try {
    await ServerStats.findOneAndUpdate(
      { guildId, "topListeners.userId": userId },
      { 
        $inc: { 
          totalListening: seconds,
          "topListeners.$.listeningTime": seconds
        },
        $set: { updatedAt: Date.now() }
      }
    );
    
    // Also update global profile
    await addListeningTime(userId, seconds);
  } catch (err) {
    console.error("[DATABASE] Error addUserServerListeningTime:", err.message);
  }
}

/**
 * Get voice channel listeners
 */
async function getVoiceChannelListeners(guildId) {
  const serverStats = await getServerStats(guildId);
  return {
    voiceChannelId: serverStats?.voiceChannelId,
    currentListeners: serverStats?.currentListeners || [],
    totalListening: serverStats?.totalListening || 0
  };
}

/**
 * Get top server listeners
 */
async function getTopServerListeners(guildId, limit = 10) {
  const serverStats = await getServerStats(guildId);
  if (!serverStats?.topListeners) return [];
  return serverStats.topListeners
    .sort((a, b) => b.listeningTime - a.listeningTime)
    .slice(0, limit);
}

/**
 * Get global top listeners
 */
async function getGlobalTopListeners(limit = 10) {
  if (!isConnected) return [];
  
  try {
    const profiles = await Profile.find()
      .sort({ totalListening: -1 })
      .limit(limit);
    
    return profiles.map(p => ({
      userId: p.userId,
      username: p.username,
      totalListening: p.totalListening || 0,
      totalCommands: p.totalCommands || 0
    }));
  } catch (err) {
    console.error("[DATABASE] Error getGlobalTopListeners:", err.message);
    return [];
  }
}

/**
 * Get user stats (leaderboard)
 */
async function getUserStats() {
  if (!isConnected) return [];
  
  try {
    const profiles = await Profile.find().sort({ totalListening: -1 });
    return profiles.map(p => ({
      userId: p.userId,
      username: p.username,
      totalCommands: p.totalCommands || 0,
      totalListening: p.totalListening || 0
    }));
  } catch (err) {
    console.error("[DATABASE] Error getUserStats:", err.message);
    return [];
  }
}

/**
 * Format listening time
 */
function formatListeningTime(seconds) {
  if (!seconds || seconds < 0) return "0 menit";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  } else if (minutes > 0) {
    return `${minutes} menit ${secs} detik`;
  } else {
    return `${secs} detik`;
  }
}

/**
 * Get stats summary
 */
async function getStatsSummary() {
  const globalStats = await getStats();
  const topListeners = await getGlobalTopListeners(10);

  return {
    totalListening: globalStats?.totalListening || 0,
    totalTracksPlayed: globalStats?.totalTracksPlayed || 0,
    formattedTotalListening: formatListeningTime(globalStats?.totalListening || 0),
    topTracks: globalStats?.topTracks || [],
    topArtists: globalStats?.topArtists || [],
    topListeners
  };
}

/**
 * Check if MongoDB is connected
 */
function isMongoConnected() {
  return isConnected;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  initDatabase,
  isMongoConnected,
  getProfile,
  saveProfile,
  incrementCommandCount,
  addListeningTime,
  get247Mode,
  set247Mode,
  toggle247Mode,
  remove247Mode,
  getAll247Guilds,
  getStats,
  incrementTracksPlayed,
  addGlobalListeningTime,
  getServerStats,
  saveServerStats,
  updateVoiceListeners,
  addUserServerListeningTime,
  getVoiceChannelListeners,
  getTopServerListeners,
  getGlobalTopListeners,
  getUserStats,
  getStatsSummary,
  formatListeningTime
};

/**
 * PPLGBot - Database Module
 * Pure MongoDB implementation with automatic JSON migration
 */

