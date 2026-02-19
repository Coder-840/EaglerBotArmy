const mineflayer = require('mineflayer');
const eaglercraft = require('mineflayer-eaglercraft');

const SETTINGS = {
  url: 'wss://eagler.noBnoT.org', // Use the full WebSocket URL
  version: '1.12.2',
  message: '>Domplayzallgames LOVES SPREADING_DARK and they are a really happy couple. Thye cuddle every night in bed :D',
  botCount: 3
};

function generateName() {
  return 'Bot_' + Math.random().toString(36).substring(2, 8);
}

function createBot() {
  const name = generateName();
  console.log(`Attempting to join: ${name}`);

  const bot = mineflayer.createBot({
    connect: eaglercraft.createConnector(SETTINGS.url),
    username: name,
    version: SETTINGS.version
  });

  bot.once('spawn', () => {
    console.log(`${name} successfully spawned.`);
    
    // Commands for Eaglercraft servers
    bot.chat(`/register Password123 Password123`);
    bot.chat(`/login Password123`);
    
    setTimeout(() => {
      bot.chat(SETTINGS.message);
      console.log(`${name} sent message.`);
      
      setTimeout(() => {
        bot.quit();
        console.log(`${name} left. Restarting cycle...`);
        setTimeout(createBot, 5000); 
      }, 2000);
    }, 4000);
  });

  bot.on('error', (err) => console.log(`[Error] ${name}:`, err.message));
  bot.on('kicked', (reason) => console.log(`[Kicked] ${name}:`, reason));
  bot.on('end', () => console.log(`[Disconnected] ${name}`));
}

// Start the trio with staggered joins
for (let i = 0; i < SETTINGS.botCount; i++) {
  setTimeout(() => createBot(), i * 3000);
}
