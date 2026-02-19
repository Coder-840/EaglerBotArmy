const mineflayer = require('mineflayer');

// Configuration
const SETTINGS = {
  host: 'noBnoT.org', // The target server IP
  port: 25565,
  version: '1.12.2',
  message: '>Domplayzallgames LOVES SPREADING_DARK and they are a really happy couple. Thye cuddle every night in bed :D',
  botCount: 3
};

function generateName() {
  return 'Bot_' + Math.random().toString(36).substring(2, 8);
}

function createBot() {
  const name = generateName();
  console.log(`Deploying bot: ${name}`);

  const bot = mineflayer.createBot({
    host: SETTINGS.host,
    port: SETTINGS.port,
    username: name,
    version: SETTINGS.version
  });

  bot.once('spawn', () => {
    console.log(`${name} joined.`);
    // Automatically register and login
    bot.chat(`/register Password123 Password123`);
    bot.chat(`/login Password123`);
    
    // Wait 3 seconds, send message, then leave
    setTimeout(() => {
      bot.chat(SETTINGS.message);
      setTimeout(() => {
        bot.quit();
        console.log(`${name} left. Restarting in 5s...`);
        setTimeout(createBot, 1000); // Cycle to a new bot
      }, 2000);
    }, 3000);
  });

  bot.on('error', (err) => console.log(`Error for ${name}:`, err));
  bot.on('kicked', (reason) => console.log(`${name} kicked:`, reason));
}

// Start the trio
for (let i = 0; i < SETTINGS.botCount; i++) {
  setTimeout(() => createBot(), i * 2000); // Stagger joins
}
