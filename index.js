const mineflayer = require('mineflayer');

// === CONFIGURATION ===
const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 5,
    password: 'SafeBot123!',
    spamInterval: 2500,    // 8 seconds between chat messages
    minJoinDelay: 1000,    // 1 second
    maxJoinDelay: 30000    // 30 seconds
};

let botsJoined = 0;

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

function createBot(id) {
    const name = `User_${randomStr(5)}`;
    console.log(`[Queue] Launching ${name} (Bot #${id + 1})...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8'
    });

    // Auto-Login/Register
    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (msg.includes("/login")) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.on('spawn', () => {
        console.log(`>>> ${name} joined.`);
        
        // Anti-AFK: Jump occasionally
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 15000);

        // Spamming loop
        setInterval(() => {
            if (bot.entity) bot.chat(randomStr(8));
        }, CONFIG.spamInterval);
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] ${name} kicked: ${reason}`);
        // Wait 45s before replacing a kicked bot to protect IP
        setTimeout(() => createBot(id), 45000); 
    });

    bot.on('error', (err) => console.log(`[Error] ${name}: ${err.code}`));
}

// --- RANDOMIZED SEQUENTIAL JOINER ---
function startQueue(currentId) {
    if (currentId >= CONFIG.botCount) return;

    createBot(currentId);

    // Pick a random delay between 1 and 30 seconds for the NEXT bot
    const nextDelay = Math.floor(Math.random() * (CONFIG.maxJoinDelay - CONFIG.minJoinDelay + 1)) + CONFIG.minJoinDelay;
    
    console.log(`[Queue] Next bot in ${Math.round(nextDelay/1000)}s...`);
    
    setTimeout(() => {
        startQueue(currentId + 1);
    }, nextDelay);
}

// Kick off the first bot
startQueue(0);
