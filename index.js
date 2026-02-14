const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 15000, 
    // Updated API URL
    proxyApi: 'https://api.proxyscrape.com'
};

let proxyList = [];
let currentProxyIdx = 0;

async function refreshProxies() {
    try {
        console.log("[System] Scraping fresh SOCKS5 proxies...");
        const response = await axios.get(CONFIG.proxyApi);
        // Clean up the response and parse IPs
        proxyList = response.data.trim().split(/\s+/).filter(p => p.includes(':')).map(p => {
            const [host, port] = p.split(':');
            return { host, port: parseInt(port) };
        });
        
        if (proxyList.length === 0) {
            console.log("[!] Scraper returned 0. Using hardcoded fallback...");
            proxyList = [{ host: '127.0.0.1', port: 1080 }]; // Placeholder
        } else {
            console.log(`[System] Found ${proxyList.length} proxy candidates.`);
        }
    } catch (err) {
        console.error('[Error] Scraper failed:', err.message);
    }
}

function createBot(id, botName = null) {
    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    // First 2 bots direct (safer than 4), rest proxy
    const useProxy = id >= 2;
    const proxy = useProxy ? proxyList[currentProxyIdx++ % proxyList.length] : null;

    console.log(`[Slot ${id + 1}] ${name} -> ${useProxy ? 'Proxy: ' + proxy.host : 'DIRECT'}`);

    const botOptions = {
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        fakeHost: CONFIG.host, // CRITICAL: Makes connection look like it came from noBnoT.org
        physicsEnabled: false
    };

    if (useProxy && proxy) {
        botOptions.connect = (client) => {
            Socks.createConnection({
                proxy: { host: proxy.host, port: proxy.port, type: 5 },
                command: 'connect',
                timeout: 10000, 
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    console.log(`[Dead Proxy] ${proxy.host} failed. Retrying...`);
                    return createBot(id, name);
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        };
    }

    const bot = mineflayer.createBot(botOptions);

    bot.on('message', (json) => {
        const m = json.toString();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> SUCCESS: ${name} IS IN.`);
        // Random chatter to stay active
        setInterval(() => { if (bot.entity) bot.chat(Math.random().toString(36).substring(7)); }, 8000);
    });

    bot.on('kicked', (reason) => {
        const r = reason.toString();
        console.log(`[Kicked] ${name}: ${r.substring(0, 60)}...`);
        
        // If suspicious, wait longer or try new proxy
        const delay = r.includes("suspicious") ? 120000 : 30000;
        setTimeout(() => createBot(id), delay);
    });

    bot.on('error', (err) => {
        if (useProxy) createBot(id, name);
    });
}

async function main() {
    await refreshProxies();
    for (let i = 0; i < CONFIG.botCount; i++) {
        // Slow down the join sequence significantly to avoid IP bans
        await new Promise(r => setTimeout(r, CONFIG.joinDelay));
        createBot(i);
    }
}

main();
