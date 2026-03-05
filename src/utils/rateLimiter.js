/**
 * PPLGBot - Rate Limiter & Security System
 * Mencegah abuse dan spam command
 */

class RateLimiter {
  constructor() {
    this.userCooldowns = new Map();
    this.guildCooldowns = new Map();
    this.commandCounts = new Map();
    
    // Default settings
    this.settings = {
      userCooldown: 3000, // 3 seconds between commands
      guildCooldown: 1000, // 1 second between commands per guild
      maxCommandsPerMinute: 20, // Max commands per user per minute
      maxPlayCommandsPerMinute: 10, // Max play commands per minute
      maxConcurrentPlays: 3, // Max concurrent play requests
      enabled: true
    };
  }

  /**
   * Configure rate limiter
   */
  configure(options) {
    this.settings = { ...this.settings, ...options };
  }

  /**
   * Check if user is on cooldown
   */
  checkUserCooldown(userId, commandName) {
    if (!this.settings.enabled) return { allowed: true };

    const key = `${userId}:${commandName}`;
    const now = Date.now();
    const cooldown = this.userCooldowns.get(key);

    if (cooldown && now - cooldown < this.settings.userCooldown) {
      const remaining = Math.ceil((this.settings.userCooldown - (now - cooldown)) / 1000);
      return {
        allowed: false,
        reason: "user_cooldown",
        remaining: remaining,
        message: `Tunggu ${remaining} detik sebelum menggunakan command ini.`
      };
    }

    this.userCooldowns.set(key, now);
    return { allowed: true };
  }

  /**
   * Check if guild is on cooldown
   */
  checkGuildCooldown(guildId, commandName) {
    if (!this.settings.enabled) return { allowed: true };

    const key = `${guildId}:${commandName}`;
    const now = Date.now();
    const cooldown = this.guildCooldowns.get(key);

    if (cooldown && now - cooldown < this.settings.guildCooldown) {
      return {
        allowed: false,
        reason: "guild_cooldown",
        remaining: Math.ceil((this.settings.guildCooldown - (now - cooldown)) / 1000),
        message: "Command terlalu cepat. Coba lagi sebentar."
      };
    }

    this.guildCooldowns.set(key, now);
    return { allowed: true };
  }

  /**
   * Check command count for rate limiting
   */
  checkCommandCount(userId, commandName) {
    if (!this.settings.enabled) return { allowed: true };

    const key = `${userId}:${commandName}`;
    const now = Date.now();
    const minuteAgo = now - 60000;

    let counts = this.commandCounts.get(key) || [];
    
    // Filter out old counts
    counts = counts.filter(timestamp => timestamp > minuteAgo);

    const maxCommands = commandName === "play" 
      ? this.settings.maxPlayCommandsPerMinute 
      : this.settings.maxCommandsPerMinute;

    if (counts.length >= maxCommands) {
      return {
        allowed: false,
        reason: "rate_limit",
        remaining: Math.ceil((counts[0] + 60000 - now) / 1000),
        message: `Terlalu banyak command. Coba lagi dalam ${Math.ceil((counts[0] + 60000 - now) / 1000)} detik.`
      };
    }

    counts.push(now);
    this.commandCounts.set(key, counts);
    return { allowed: true };
  }

  /**
   * Main check function
   */
  check(interaction) {
    if (!this.settings.enabled) return { allowed: true };

    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const commandName = interaction.commandName;

    // Check user cooldown
    const userCheck = this.checkUserCooldown(userId, commandName);
    if (!userCheck.allowed) return userCheck;

    // Check guild cooldown
    if (guildId) {
      const guildCheck = this.checkGuildCooldown(guildId, commandName);
      if (!guildCheck.allowed) return guildCheck;
    }

    // Check command count
    const countCheck = this.checkCommandCount(userId, commandName);
    if (!countCheck.allowed) return countCheck;

    return { allowed: true };
  }

  /**
   * Check if user has DJ role
   */
  hasDjRole(member, guildSettings) {
    if (!guildSettings || !guildSettings.djRoleId) {
      return true; // No DJ role required
    }

    if (!member) return false;

    // Check if user is admin
    if (member.permissions.has("Administrator")) {
      return true;
    }

    // Check for DJ role
    if (member.roles.cache.has(guildSettings.djRoleId)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(member) {
    if (!member) return false;
    return member.permissions.has("Administrator") || member.ownerId === member.user.id;
  }

  /**
   * Clear user cooldown
   */
  clearUserCooldown(userId, commandName) {
    const key = `${userId}:${commandName}`;
    this.userCooldowns.delete(key);
  }

  /**
   * Clear guild cooldown
   */
  clearGuildCooldown(guildId, commandName) {
    const key = `${guildId}:${commandName}`;
    this.guildCooldowns.delete(key);
  }

  /**
   * Clear all cooldowns for a user
   */
  clearUser(userId) {
    for (const [key] of this.userCooldowns) {
      if (key.startsWith(`${userId}:`)) {
        this.userCooldowns.delete(key);
      }
    }
    for (const [key] of this.commandCounts) {
      if (key.startsWith(`${userId}:`)) {
        this.commandCounts.delete(key);
      }
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      userCooldowns: this.userCooldowns.size,
      guildCooldowns: this.guildCooldowns.size,
      commandCounts: this.commandCounts.size,
      settings: this.settings
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const minuteAgo = now - 60000;

    // Clean user cooldowns
    for (const [key, timestamp] of this.userCooldowns) {
      if (now - timestamp > 300000) { // 5 minutes
        this.userCooldowns.delete(key);
      }
    }

    // Clean guild cooldowns
    for (const [key, timestamp] of this.guildCooldowns) {
      if (now - timestamp > 60000) { // 1 minute
        this.guildCooldowns.delete(key);
      }
    }

    // Clean command counts
    for (const [key, timestamps] of this.commandCounts) {
      const filtered = timestamps.filter(t => t > minuteAgo);
      if (filtered.length === 0) {
        this.commandCounts.delete(key);
      } else {
        this.commandCounts.set(key, filtered);
      }
    }
  }
}

// Export singleton
module.exports = new RateLimiter();
module.exports.RateLimiter = RateLimiter;

