const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123',
    joinDelay: 45000, 
    verifyDelay: 8000,
    spamInterval: 2500,
    // Add your SOCKS5 proxies here. Format: { host, port }
    // You need at least 3 proxies to run 10 bots (4 accounts per IP).
    proxies: [
        { host: '94.130.177.190:9999', port: 1080 },
        { host: '201.68.215.79:61221', port: 1080 },
        { host: '110.235.248.142:1080', port: 1080 }
    ]
};

function createBot(id, botName = null) {
    const name = botName || `User_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    // Select proxy based on bot ID (4 bots per proxy)
    const proxyIndex = Math.floor(id / 4);
    const proxy = CONFIG.proxies[proxyIndex];

    console.log(`[Slot ${id + 1}] Connecting ${name} via ${proxy ? proxy.host : 'DIRECT'}...`);

    const botOptions = {
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        physicsEnabled: false,
        fakeHost: CONFIG.host // Helps bypass some handshake filters
    };

    // If a proxy exists, override the connection logic
    if (proxy) {
        botOptions.connect = (client) => {
            Socks.createConnection({
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    type: 5 // SOCKS5 is required for Minecraft
                },
                command: 'connect',
                destination: {
                    host: CONFIG.host,
                    port: CONFIG.port
                }
            }, (err, info) => {
                if (err) {
                    console.log(`[Proxy Error] ${name} failed: ${err.message}`);
                    return;
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        };
    }

    const bot = mineflayer.createBot(botOptions);

    bot.on('message', (json) => {
        const m = json.toString().toLowerCase();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} IS IN THE SYSTEM.`);
        
        setInterval(() => {
            if (bot.entity) {
                const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
                bot.chat(hex);
            }
        }, CONFIG.spamInterval);

        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 20000);
    });

    bot.on('kicked', (reason) => {
        const msg = reason.toString();
        if (msg.includes("verified") || msg.includes("re-connect")) {
            setTimeout(() => createBot(id, name), CONFIG.verifyDelay);
        } else {
            console.log(`[Kicked] ${name}. Cooling down 2 mins...`);
            setTimeout(() => createBot(id), 120000);
        }
    });

    bot.on('error', (err) => console.log(`[Error] ${name}: ${err.message}`));
}

console.log("Starting Proxy-Cram sequence...");
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
