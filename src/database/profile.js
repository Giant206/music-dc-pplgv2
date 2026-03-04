/**
 * PPLGBot - Database: Profile & 247 Mode
 * Menyimpan profile pengguna dan setting 247 per server
 */

const { Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

// Database file path
const dbPath = path.join(__dirname, "../../data");

// Ensure data directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const profilesFile = path.join(dbPath, "profiles.json");
const mode247File = path.join(dbPath, "247.json");

/**
 * Load data from JSON file
 */
function loadData(file) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err.message);
  }
  return {};
}

/**
 * Save data to JSON file
 */
function saveData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving ${file}:`, err.message);
  }
}

// In-memory cache
const profiles = new Collection();
const mode247Settings = new Collection();

/**
 * Initialize database
 */
function initDatabase() {
  // Load profiles
  const profilesData = loadData(profilesFile);
  for (const [userId, data] of Object.entries(profilesData)) {
    profiles.set(userId, data);
  }

  // Load 247 settings
  const mode247Data = loadData(mode247File);
  for (const [guildId, data] of Object.entries(mode247Data)) {
    mode247Settings.set(guildId, data);
  }

  console.log(`[DATABASE] Loaded ${profiles.size} profiles and ${mode247Settings.size} 247 settings`);
}

/**
 * Get user profile
 */
function getProfile(userId) {
  return profiles.get(userId) || {
    userId,
    username: "Unknown",
    bio: "",
    favoriteGenre: "",
    totalCommands: 0,
    totalListening: 0,
    createdAt: Date.now()
  };
}

/**
 * Save user profile
 */
function saveProfile(userId, profileData) {
  const profile = {
    ...getProfile(userId),
    ...profileData,
    userId,
    updatedAt: Date.now()
  };
  
  profiles.set(userId, profile);
  
  // Save to file
  const data = {};
  profiles.forEach((p, id) => {
    data[id] = p;
  });
  saveData(profilesFile, data);
  
  return profile;
}

/**
 * Increment user command count
 */
function incrementCommandCount(userId) {
  const profile = getProfile(userId);
  profile.totalCommands = (profile.totalCommands || 0) + 1;
  profile.updatedAt = Date.now();
  saveProfile(userId, profile);
}

/**
 * Add listening time (in seconds)
 */
function addListeningTime(userId, seconds) {
  const profile = getProfile(userId);
  profile.totalListening = (profile.totalListening || 0) + seconds;
  profile.updatedAt = Date.now();
  saveProfile(userId, profile);
}

/**
 * Get 247 mode for guild
 */
function get247Mode(guildId) {
  return mode247Settings.get(guildId) || {
    enabled: false,
    voiceChannelId: null,
    textChannelId: null,
    volume: 100,
    autoplay: false,
    loop: "off",
    createdAt: null,
    lastUsed: null
  };
}

/**
 * Set 247 mode for guild
 */
function set247Mode(guildId, settings) {
  const current = get247Mode(guildId);
  const newSettings = {
    ...current,
    ...settings,
    lastUsed: Date.now(),
    createdAt: current.createdAt || Date.now()
  };
  
  mode247Settings.set(guildId, newSettings);
  
  // Save to file
  const data = {};
  mode247Settings.forEach((s, id) => {
    data[id] = s;
  });
  saveData(mode247File, data);
  
  return newSettings;
}

/**
 * Toggle 247 mode
 */
function toggle247Mode(guildId, voiceChannelId, textChannelId) {
  const current = get247Mode(guildId);
  
  if (current.enabled) {
    // Disable 247
    return set247Mode(guildId, { enabled: false });
  } else {
    // Enable 247
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
function remove247Mode(guildId) {
  mode247Settings.delete(guildId);
  
  // Save to file
  const data = {};
  mode247Settings.forEach((s, id) => {
    data[id] = s;
  });
  saveData(mode247File, data);
}

/**
 * Get all 247 enabled guilds
 */
function getAll247Guilds() {
  const guilds = [];
  mode247Settings.forEach((settings, guildId) => {
    if (settings.enabled) {
      guilds.push({ guildId, ...settings });
    }
  });
  return guilds;
}

/**
 * Get user stats (leaderboard)
 */
function getUserStats() {
  const stats = [];
  profiles.forEach((profile, userId) => {
    stats.push({
      userId,
      username: profile.username,
      totalCommands: profile.totalCommands || 0,
      totalListening: profile.totalListening || 0
    });
  });
  
  // Sort by total commands
  return stats.sort((a, b) => b.totalCommands - a.totalCommands);
}

module.exports = {
  initDatabase,
  getProfile,
  saveProfile,
  incrementCommandCount,
  addListeningTime,
  get247Mode,
  set247Mode,
  toggle247Mode,
  remove247Mode,
  getAll247Guilds,
  getUserStats
};

/**
 * PPLGBot - Database Module
 * Supports profile and 247 mode per server
 */

