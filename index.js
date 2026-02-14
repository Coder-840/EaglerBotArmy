const mineflayer = require('mineflayer');

// === EDIT THESE SETTINGS ONLY ===
const SERVER_SETTINGS = {
    host: 'noBnoT.org',       // The Java IP (no wss://)
    port: 25565,                  // Usually 25565
    botCount: 5,                  // Number of bots
    password: 'BotPassword123!',  // Password for /register
    joinDelay: 2500,             
    spamSpeed: 1000               
};

let activeBots = [];

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len);
}

function createBot(id) {
    const name = `Bot_${randomStr(5)}`;
    console.log(`[${id + 1}] Launching ${name}...`);

    const bot = mineflayer.createBot({
        host: SERVER_SETTINGS.host,
        port: SERVER_SETTINGS.port,
        username: name,
        version: '1.8.8'
    });

    // AUTO-LOGIN & REGISTER
    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) {
            bot.chat(`/register ${SERVER_SETTINGS.password} ${SERVER_SETTINGS.password}`);
        } else if (msg.includes("/login")) {
            bot.chat(`/login ${SERVER_SETTINGS.password}`);
        }
    });

    // START SPAMMING AS SOON AS THIS SPECIFIC BOT IS READY
    bot.on('spawn', () => {
        console.log(`>>> ${bot.username} is in and active.`);
        
        // Add to active list if not already there
        if (!activeBots.find(b => b.username === bot.username)) {
            activeBots.push(bot);
        }

        // Start this bot's individual spam loop
        const spamInterval = setInterval(() => {
            if (bot && bot.entity) {
                bot.chat(randomStr(8).toUpperCase());
            } else {
                clearInterval(spamInterval);
            }
        }, SERVER_SETTINGS.spamSpeed);
    });

    // AUTO-RECONNECT ON KICK
    bot.on('kicked', (reason) => {
        console.log(`[!] ${name} kicked: ${reason}`);
        activeBots = activeBots.filter(b => b.username !== name);
        
        // If it's the "Analyzing" kick, join back fast. Otherwise, wait.
        const delay = reason.includes("analyzing") ? 2000 : 20000;
        setTimeout(() => createBot(id), delay);
    });

    bot.on('error', (err) => console.log(`Error on ${name}: ${err.code}`));
}

// Start the sequence
console.log(`Starting deployment for ${SERVER_SETTINGS.botCount} bots...`);
for (let i = 0; i < SERVER_SETTINGS.botCount; i++) {
    setTimeout(() => createBot(i), i * SERVER_SETTINGS.joinDelay);
}
