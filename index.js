const mineflayer = require("mineflayer")

// ===== CONFIG =====
const HOST = "noBnoT.org"
const PORT = 25565
const VERSION = "1.12.2"
const MESSAGE = "Hello from bot!"
const PASSWORD = "botpass"
const DELAY = 15000
// ==================

function randomName() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

function startBot(id) {
  const username = randomName()

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username,
    version: VERSION
  })

  console.log(`Bot ${id} joining as ${username}`)

  bot.once("spawn", () => {
    setTimeout(() => bot.chat(`/register ${PASSWORD} ${PASSWORD}`), 2000)
    setTimeout(() => bot.chat(MESSAGE), 4000)
    setTimeout(() => bot.quit(), 6000)
  })

  bot.on("end", () => {
    console.log(`Bot ${id} restarting...`)
    setTimeout(() => startBot(id), DELAY)
  })

  bot.on("error", err => {
    console.log(`Bot ${id} error: ${err.message}`)
  })
}

// launch 3 bots
for (let i = 1; i <= 3; i++) startBot(i)
