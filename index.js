const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    // ULTRA SLOW: 45 seconds between bots. 
    // This allows the server's "Recent Joins" counter to decay.
    joinDelay: 45000, 
    verifyDelay: 8000,
    spamInterval: 2500 // 12s to avoid chat-limit bans
};

function createBot(id, botName = null) {
    const name = botName || `User_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    console.log(`[Slot ${id + 1}] Sneaking in ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        // Disable physics to reduce packet footprint
        physicsEnabled: false
    });

    bot.on('message', (json) => {
        const m = json.toString().toLowerCase();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} IS IN THE SYSTEM.`);
        
        // Random Hex Spam
        setInterval(() => {
            if (bot.entity) {
                const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
                bot.chat(hex);
            }
        }, CONFIG.spamInterval);

        // Subtle Anti-AFK
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 20000);
    });

    bot.on('kicked', (reason) => {
        const msg = reason.toString();
        // TCPShield Bypass
        if (msg.includes("verified") || msg.includes("re-connect") || msg.includes("analyzing")) {
            console.log(`[Shield] ${name} verifying...`);
            setTimeout(() => createBot(id, name), CONFIG.verifyDelay);
        } else {
            console.log(`[Kicked] ${name}. Cooling down 2 mins...`);
            setTimeout(() => createBot(id), 120000); // 2 min wait to clear the IP flag
        }
    });

    bot.on('error', () => {});
}

// Start the slow trickle
console.log("Starting Ghost-Cram sequence. 10 bots will take ~7.5 minutes.");
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
