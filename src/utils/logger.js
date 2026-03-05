/**
 * PPLGBot - Logger Utility
 * Sistem logging dengan timestamp, level, dan warna
 */

const chalk = require("chalk");

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level (default: INFO)
let currentLevel = LOG_LEVELS.INFO;

// Colors for different log types
const colors = {
  debug: chalk.gray,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
  success: chalk.green,
  music: chalk.magenta,
  queue: chalk.blue,
  system: chalk.cyan,
  time: chalk.gray
};

/**
 * Format timestamp
 */
function formatTimestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Set log level
 */
function setLevel(level) {
  if (typeof level === "string") {
    currentLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  } else {
    currentLevel = level;
  }
}

/**
 * Get log level string
 */
function getLevel() {
  return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLevel);
}

/**
 * Debug log
 */
function debug(...args) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.log(colors.debug(`[${formatTimestamp()}] [DEBUG]`), ...args);
  }
}

/**
 * Info log
 */
function info(...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.info(`[${formatTimestamp()}] [INFO]`), ...args);
  }
}

/**
 * Warn log
 */
function warn(...args) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.log(colors.warn(`[${formatTimestamp()}] [WARN]`), ...args);
  }
}

/**
 * Error log
 */
function error(...args) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(colors.error(`[${formatTimestamp()}] [ERROR]`), ...args);
  }
}

/**
 * Success log
 */
function success(...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.success(`[${formatTimestamp()}] [SUCCESS]`), ...args);
  }
}

/**
 * Music event log
 */
function music(event, ...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.music(`[${formatTimestamp()}] [MUSIC:${event}]`), ...args);
  }
}

/**
 * Queue event log
 */
function queue(action, ...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.queue(`[${formatTimestamp()}] [QUEUE:${action}]`), ...args);
  }
}

/**
 * System log
 */
function system(component, ...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.system(`[${formatTimestamp()}] [SYSTEM:${component}]`), ...args);
  }
}

/**
 * Command log
 */
function cmd(...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.system("CMD"), ...args);
  }
}

/**
 * Riffy event log
 */
function riffy(event, ...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(colors.system(`[${formatTimestamp()}] [RIFFY:${event}]`), ...args);
  }
}

/**
 * Log music start event
 */
function logMusicStart(track, guildName) {
  music("START", colors.green("🎵 Music started:"), track.title, "by", track.author, "| Guild:", guildName);
}

/**
 * Log music end event
 */
function logMusicEnd(track, guildName) {
  music("END", colors.gray("⏹️ Music ended:"), track.title, "| Guild:", guildName);
}

/**
 * Log queue add
 */
function logQueueAdd(track, position, guildName) {
  queue("ADD", colors.blue("➕ Added to queue:"), track.title, "| Position:", position, "| Guild:", guildName);
}

/**
 * Log queue remove
 */
function logQueueRemove(track, position, guildName) {
  queue("REMOVE", colors.yellow("➖ Removed from queue:"), track.title, "| Position:", position, "| Guild:", guildName);
}

/**
 * Log Lavalink reconnect
 */
function logLavalinkReconnect(nodeName, attempt) {
  system("LAVALINK", colors.cyan("🔄 Reconnecting to node:"), nodeName, "| Attempt:", attempt);
}

/**
 * Log error with stack
 */
function logErrorStack(err, context) {
  error(colors.red("❌ Error occurred:"), context || "Unknown context");
  if (err && err.stack) {
    console.error(colors.gray(err.stack));
  }
}

/**
 * Create logger for specific module
 */
function createLogger(moduleName) {
  return {
    debug: (...args) => debug(`[${moduleName}]`, ...args),
    info: (...args) => info(`[${moduleName}]`, ...args),
    warn: (...args) => warn(`[${moduleName}]`, ...args),
    error: (...args) => error(`[${moduleName}]`, ...args),
    success: (...args) => success(`[${moduleName}]`, ...args),
    music: (event, ...args) => music(event, `[${moduleName}]`, ...args),
    queue: (action, ...args) => queue(action, `[${moduleName}]`, ...args),
    system: (component, ...args) => system(component, `[${moduleName}]`, ...args),
    cmd: (...args) => cmd(`[${moduleName}]`, ...args)
  };
}

module.exports = {
  setLevel,
  getLevel,
  debug,
  info,
  warn, 
  error,
  success,
  music,
  queue,
  system,
  cmd,
  riffy,
  logMusicStart,
  logMusicEnd,
  logQueueAdd,
  logQueueRemove,
  logLavalinkReconnect,
  logErrorStack,
  createLogger,
  LOG_LEVELS
};

/**
 * PPLGBot - Logger Utility
 * Usage: const logger = require('./utils/logger');
 * logger.info('Hello world');
 * logger.music('START', 'Playing song');
 * const myLogger = logger.createLogger('MyModule');
 */

