const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 15000, 
    // Reliability sources (GitHub raw files are rarely blocked)
    sources: [
        'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/refs/heads/master/socks5.txt',
        'https://api.proxyscrape.com'
    ]
};

let proxyList = [];
let currentProxyIdx = 0;

async function refreshProxies() {
    console.log("[System] Gathering SOCKS5 proxies from multiple sources...");
    for (const url of CONFIG.sources) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            const lines = response.data.trim().split(/\r?\n/);
            const parsed = lines.filter(p => p.includes(':')).map(p => {
                const [host, port] = p.split(':');
                return { host, port: parseInt(port) };
            });
            proxyList = [...proxyList, ...parsed];
            console.log(`[Source] Loaded ${parsed.length} from ${new URL(url).hostname}`);
        } catch (err) {
            console.log(`[Source] Failed to load from ${new URL(url).hostname}`);
        }
    }
    
    // Shuffle the list so everyone isn't using the same "first" proxy
    proxyList = proxyList.sort(() => Math.random() - 0.5);
    console.log(`[System] Total usable proxy candidates: ${proxyList.length}`);
}

function createBot(id, botName = null) {
    if (proxyList.length === 0) return setTimeout(() => createBot(id, botName), 5000);

    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    // Keep 2 bots direct, others use proxies
    const useProxy = id >= 2;
    const proxy = useProxy ? proxyList[currentProxyIdx++ % proxyList.length] : null;

    console.log(`[Slot ${id + 1}] ${name} -> ${useProxy ? 'Proxy: ' + proxy.host : 'DIRECT'}`);

    const botOptions = {
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        fakeHost: CONFIG.host,
        physicsEnabled: false
    };

    if (useProxy && proxy) {
        botOptions.connect = (client) => {
            Socks.createConnection({
                proxy: { host: proxy.host, port: proxy.port, type: 5 },
                command: 'connect',
                timeout: 7000, 
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    // Try next proxy immediately
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
        setInterval(() => { if (bot.entity) bot.chat(Math.random().toString(36).substring(7)); }, 10000);
    });

    bot.on('kicked', (reason) => {
        const r = reason.toString();
        console.log(`[Kicked] ${name}: ${r.substring(0, 50)}...`);
        // If we get the 'suspicious' kick, it means that proxy is burnt. Retry with new one.
        if (r.includes("suspicious") || r.includes("notbot")) {
             return createBot(id);
        }
        setTimeout(() => createBot(id), 30000);
    });

    bot.on('error', () => {});
}

async function main() {
    await refreshProxies();
    if (proxyList.length === 0) {
        console.log("FATAL: Could not load any proxies. Check your internet connection.");
        return;
    }
    for (let i = 0; i < CONFIG.botCount; i++) {
        createBot(i);
        await new Promise(r => setTimeout(r, CONFIG.joinDelay));
    }
}

main();
