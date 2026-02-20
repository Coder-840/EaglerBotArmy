import mineflayer from 'mineflayer';

const SERVER = {
  host: 'noBnoT.org',
  port: 25565,
  version: false
};

const PASSWORD = 'Password123'; // password for /register or /login
const MAX_BOTS = 3;

let activeBots = [];

// Generate random bot name
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

  let loggedIn = false;

  bot.once('spawn', () => {
    console.log(`${name} spawned.`);

    // Listen for server messages to detect registration/login prompts
    bot.on('messagestr', message => {
      const msg = message.toLowerCase();

      // Only send register/login if not already logged in
      if (!loggedIn) {
        if (msg.includes('/register')) {
          console.log(`${name} registering...`);
          bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        } else if (msg.includes('/login')) {
          console.log(`${name} logging in...`);
          bot.chat(`/login ${PASSWORD}`);
        } else if (msg.includes('welcome') || msg.includes('joined')) {
          // Mark bot as fully logged in once server confirms join
          loggedIn = true;

          // Say Hello and leave shortly after
          setTimeout(() => {
            bot.chat('Hello!');
            setTimeout(() => bot.quit('Goodbye!'), 3000 + Math.random() * 2000);
          }, 2000);
        }
      }
    });
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

// Start the system
maintainBots();
