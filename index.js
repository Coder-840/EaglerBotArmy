const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 20000, 
    // API for fresh SOCKS5 proxies
    proxyApi: 'https://api.proxyscrape.com'
};

let proxyList = [];
let currentProxyIdx = 0;

// Fetch fresh proxies from ProxyScrape
async function refreshProxies() {
    try {
        const response = await axios.get(CONFIG.proxyApi);
        proxyList = response.data.split('\r\n').filter(p => p.length > 0).map(p => {
            const [host, port] = p.split(':');
            return { host, port: parseInt(port) };
        });
        console.log(`[System] Scraped ${proxyList.length} fresh SOCKS5 proxies.`);
    } catch (err) {
        console.error('[Error] Failed to fetch proxies:', err.message);
    }
}

function createBot(id, botName = null) {
    if (proxyList.length === 0) return console.log("Waiting for proxies...");
    
    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    const proxy = proxyList[currentProxyIdx % proxyList.length];
    currentProxyIdx++;

    console.log(`[Slot ${id + 1}] Attempting ${name} via ${proxy.host}:${proxy.port}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        connect: (client) => {
            Socks.createConnection({
                proxy: { host: proxy.host, port: proxy.port, type: 5 },
                command: 'connect',
                timeout: 8000, // Reject slow proxies quickly
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    // Failover: if proxy is dead, try the next one immediately
                    return createBot(id, name); 
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    bot.once('spawn', () => {
        console.log(`>>> SUCCESS: ${name} is in via ${proxy.host}`);
        // Basic Anti-AFK
        setInterval(() => { if (bot.entity) bot.setControlState('jump', true); setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500); }, 20000);
    });

    bot.on('kicked', (reason) => {
        console.log(`[Kicked] ${name}: ${reason}`);
        setTimeout(() => createBot(id), 30000);
    });

    bot.on('error', () => {}); 
}

// Main Execution
async function start() {
    await refreshProxies();
    if (proxyList.length === 0) return console.log("No proxies found. Exit.");

    for (let i = 0; i < CONFIG.botCount; i++) {
        setTimeout(() => createBot(i), i * CONFIG.joinDelay);
    }
}

start();
