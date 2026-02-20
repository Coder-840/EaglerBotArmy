import mineflayer from 'mineflayer';

const SERVER = {
  host: 'noBnoT.org',
  port: 25565,
  version: false
};

const PASSWORD = 'Password123'; // for /register and /login

let activeBots = [];
const MAX_BOTS = 3;

// Random bot name
function randomName() {
  return 'Bot' + Math.floor(Math.random() * 10000);
}

// Spawn a single bot
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
    console.log(`${name} spawned.`);

    // Auto register/login
    bot.on('messagestr', message => {
      if (message.toLowerCase().includes('/register')) {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
      } else if (message.toLowerCase().includes('/login')) {
        bot.chat(`/login ${PASSWORD}`);
      }
    });

    // Wait a little and say hello
    setTimeout(() => {
      bot.chat('Hello!');
      setTimeout(() => bot.quit('Goodbye!'), 3000 + Math.random() * 2000);
    }, 4000); // wait 4s for register/login to happen
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

// Ensure we always have MAX_BOTS bots
function maintainBots() {
  while (activeBots.length < MAX_BOTS) {
    spawnBot();
  }
}

// Start
maintainBots();
