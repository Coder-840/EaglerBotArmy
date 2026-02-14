const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'FastPass123',
    joinDelay: 5000, 
    spamInterval: 3000
};

function createBot(id, botName = null) {
    // If no name is provided, generate a fresh one. 
    // If a name is provided, it means we are trying to BYPASS verification.
    const name = botName || `BOT_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    console.log(`[Bot ${id + 1}] Connecting as ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        connectTimeout: 10000
    });

    bot.on('message', (json) => {
        const m = json.toString().toLowerCase();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        else if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} PASSED TCPSHIELD!`);
        setInterval(() => {
            if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 8).toUpperCase());
        }, CONFIG.spamInterval);
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        
        // Check if TCPShield is asking for verification
        if (kickMsg.includes("verified") || kickMsg.includes("re-connect")) {
            console.log(`[Bypass] ${name} verified by TCPShield. Reconnecting...`);
            // Join back IMMEDIATELY with the SAME name
            setTimeout(() => createBot(id, name), 1000);
        } else {
            console.log(`[Kicked] ${name}: ${kickMsg.substring(0, 30)}...`);
            // For other kicks, wait 30s and start fresh
            setTimeout(() => createBot(id), 30000);
        }
    });

    bot.on('error', (err) => {
        console.log(`[Error] ${name}: ${err.message}`);
        setTimeout(() => createBot(id), 30000);
    });
}

// Start sequence
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
