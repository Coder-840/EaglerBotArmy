import mineflayer from 'mineflayer';

const SERVER = {
  host: 'noBnoT.org',
  port: 25565,
  version: false
};

let activeBots = [];
const MAX_BOTS = 3;

// Helper to generate random bot names
function randomName() {
  return 'Bot' + Math.floor(Math.random() * 10000);
}

// Function to spawn a single bot
function spawnBot() {
  const name = randomName();
  const bot = mineflayer.createBot({
    host: SERVER.host,
    port: SERVER.port,
    username: name,
    version: SERVER.version
  });

  activeBots.push(bot);

  bot.once('spawn', () => {
    console.log(`${name} joined the server.`);
    bot.chat('Hello!');
    setTimeout(() => {
      bot.quit('Goodbye!');
    }, 3000 + Math.random() * 2000); // Wait 3-5s then leave
  });

  bot.on('end', () => {
    console.log(`${name} left.`);
    activeBots = activeBots.filter(b => b !== bot);
    maintainBots();
  });

  bot.on('error', err => {
    console.log(`${name} error:`, err.message);
    activeBots = activeBots.filter(b => b !== bot);
    maintainBots();
  });
}

// Make sure we always have 3 bots
function maintainBots() {
  while (activeBots.length < MAX_BOTS) {
    spawnBot();
  }
}

// Start the process
maintainBots();
