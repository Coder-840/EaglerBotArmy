const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const axios = require('axios'); // Add "axios": "^1.6.0" to package.json

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10, // NOW WE CAN GO TO 10!
    password: 'SafeBot123!',
    // This API pulls fresh proxies so you don't have to provide them
    proxyApi: 'https://api.proxyscrape.com'
};

let proxyList = [];

async function getFreshProxies() {
    try {
        console.log("Warping IPs... Fetching fresh proxy list.");
        const res = await axios.get(CONFIG.proxyApi);
        proxyList = res.data.trim().split('\n').map(p => p.trim());
        console.log(`Found ${proxyList.length} potential 'Warp' points.`);
    } catch (e) {
        console.log("Failed to fetch proxies. Check your internet connection.");
    }
}

function createBot(id) {
    // Pick a random proxy from our freshly scraped list
    const proxyStr = proxyList[Math.floor(Math.random() * proxyList.length)];
    if (!proxyStr) return setTimeout(() => createBot(id), 5000);

    const [pHost, pPort] = proxyStr.split(':');
    const name = `Warped_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    console.log(`[Bot ${id + 1}] Warping via ${proxyStr}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        connect: (client) => {
            SocksClient.createConnection({
                proxy: { host: pHost, port: parseInt(pPort), type: 5 },
                command: 'connect',
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    // If the proxy is dead (common with free lists), try a different one
                    return createBot(id); 
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    bot.on('spawn', () => {
        console.log(`>>> ${name} Successfully Warped through IP ${pHost}`);
        setInterval(() => {
            if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 8).toUpperCase());
        }, 5000);
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] ${name} lost connection. Re-warping...`);
        setTimeout(() => createBot(id), 10000);
    });

    bot.on('error', () => {});
}

// Start the process
getFreshProxies().then(() => {
    for (let i = 0; i < CONFIG.botCount; i++) {
        setTimeout(() => createBot(i), i * 5000);
    }
});
