/**
 * PPLGBot - Utility: Logger
 * Console logging dengan warna-warna yang konsisten
 */

// ANSI color codes
const Colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    // Foreground colors
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',
        crimson: '\x1b[91m'
    },
    
    // Background colors
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        gray: '\x1b[100m'
    }
};

// Prefix untuk berbagai tipe log
const Prefix = {
    INFO: '[ℹ️ INFO]',
    SUCCESS: '[✅ SUCCESS]',
    WARNING: '[⚠️ WARNING]',
    ERROR: '[❌ ERROR]',
    DEBUG: '[🔍 DEBUG]',
    MUSIC: '[🎵 MUSIC]',
    COMMAND: '[⚡ COMMAND]',
    EVENT: '[📡 EVENT]',
    Riffy: '[🔊 RIFFY]',
    SYSTEM: '[💻 SYSTEM]',
    LOAD: '[📦 LOAD]'
};

/**
 * Format timestamp
 */
function timestamp() {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
}

/**
 * Log info
 */
function info(message, ...args) {
    console.log(`${Colors.fg.cyan}${Prefix.INFO}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log success
 */
function success(message, ...args) {
    console.log(`${Colors.fg.green}${Prefix.SUCCESS}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log warning
 */
function warn(message, ...args) {
    console.warn(`${Colors.fg.yellow}${Prefix.WARNING}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log error
 */
function error(message, ...args) {
    console.error(`${Colors.fg.red}${Prefix.ERROR}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log debug
 */
function debug(message, ...args) {
    if (process.env.DEBUG === 'true') {
        console.log(`${Colors.fg.magenta}${Prefix.DEBUG}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
    }
}

/**
 * Log music event
 */
function music(message, ...args) {
    console.log(`${Colors.fg.cyan}${Prefix.MUSIC}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}



/**
 * Log command - supports both string and multiple parameters
 */
function command(...args) {
    // If first arg is a string (could be /command or !command), treat it as the full message
    if (args[0] && typeof args[0] === 'string') {
        // Check if it's a slash command or prefix command (starts with /, !, or other prefix)
        const firstChar = args[0].charAt(0);
        if (firstChar === '/' || firstChar === '!' || firstChar === '.') {
            console.log(
                `${Colors.fg.yellow}${Prefix.COMMAND}${Colors.reset} ` +
                `${Colors.fg.gray}[${timestamp()}]${Colors.reset} ` +
                `${args[0]}`
            );
            return;
        }
    }
    
    // Otherwise treat as separate parameters: commandName, user, guild
    const [commandName, user, guild] = args;
    console.log(
        `${Colors.fg.yellow}${Prefix.COMMAND}${Colors.reset} ` +
        `${Colors.fg.gray}[${timestamp()}]${Colors.reset} ` +
        `${Colors.fg.green}${commandName}${Colors.reset} ` +
        `${Colors.fg.gray}by${Colors.reset} ${Colors.fg.cyan}${user}${Colors.reset} ` +
        (guild ? `${Colors.fg.gray}in${Colors.reset} ${Colors.fg.magenta}${guild}${Colors.reset}` : '')
    );
}


/**
 * Log event
 */
function event(eventName, ...args) {
    console.log(`${Colors.fg.blue}${Prefix.EVENT}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${Colors.fg.green}${eventName}${Colors.reset}`, ...args);
}

/**
 * Log riffy event
 */
function riffy(message, ...args) {
    console.log(`${Colors.fg.magenta}${Prefix.Riffy}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log system
 */
function system(message, ...args) {
    console.log(`${Colors.fg.gray}${Prefix.SYSTEM}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${message}`, ...args);
}

/**
 * Log loading
 */
function load(message, ...args) {
    console.log(`${Colors.fg.blue}${Prefix.LOAD}${Colors.reset} ${Colors.fg.gray}[${timestamp()}]${Colors.reset} ${Colors.fg.cyan}${message}${Colors.reset}`, ...args);
}

/**
 * Log tabel
 */
function table(data) {
    console.table(data);
}

/**
 * Log separator
 */
function separator() {
    console.log(Colors.fg.gray + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + Colors.reset);
}

/**
 * Log box
 */
function box(title, message) {
    const line = '━'.repeat(Math.max(title.length, message.length) + 4);
    console.log(Colors.fg.gray + '┌' + line + '┐' + Colors.reset);
    console.log(Colors.fg.gray + '│ ' + Colors.reset + Colors.fg.cyan + title.padEnd(message.length + 2) + Colors.reset + Colors.fg.gray + '│' + Colors.reset);
    console.log(Colors.fg.gray + '│ ' + Colors.reset + Colors.fg.white + message.padEnd(message.length + 2) + Colors.reset + Colors.fg.gray + '│' + Colors.reset);
    console.log(Colors.fg.gray + '└' + line + '┘' + Colors.reset);
}

/**
 * Startup banner
 */
function banner() {
    console.log(Colors.fg.cyan + `
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   ${Colors.fg.white}PPLGBot - Sistem Musik Modern${Colors.reset}${Colors.fg.cyan}                  ║
    ║   ${Colors.fg.gray}Versi: 2.0.0 | Discord.js v14${Colors.reset}${Colors.fg.cyan}                 ║
    ║                                                   ║
    ║   ${Colors.fg.green}✓ Loading modules...${Colors.reset}${Colors.fg.cyan}                            ║
    ╚═══════════════════════════════════════════════════╝
    ` + Colors.reset);
}

/**
 * Success banner saat bot siap
 */
function ready(botName, tag) {
    console.log(Colors.fg.green + `
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   ${Colors.fg.white}✓ ${botName} Berhasil Diaktifkan!${Colors.reset}${Colors.fg.green}               ║
    ║   ${Colors.fg.gray}User: ${tag}${Colors.reset}${Colors.fg.green}                      ║
    ║   ${Colors.fg.gray}Waktu: ${timestamp()}${Colors.reset}${Colors.fg.green}                          ║
    ║                                                   ║
    ║   ${Colors.fg.cyan}Siap menerima perintah!${Colors.reset}${Colors.fg.green}                       ║
    ╚═══════════════════════════════════════════════════╝
    ` + Colors.reset);
}

module.exports = {
    Colors,
    Prefix,
    timestamp,
    info,
    success,
    warn,
    error,
    debug,
    music,
    command,
    cmd: command, // Alias untuk command
    event,
    riffy,
    system,
    load,
    table,
    separator,
    box,
    banner,
    ready
};

