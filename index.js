const mineflayer = require("mineflayer")

const HOST = "noBnoT.org"
const PORT = 25565
const VERSION = "1.12.2"
const PASSWORD = "Test123"
const MESSAGE = "Hello"

function randomName() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let name = ""
  for (let i = 0; i < 10; i++) {
    name += chars[Math.floor(Math.random() * chars.length)]
  }
  return name
}

function createBot(name) {
  return new Promise(resolve => {

    console.log("Starting bot:", name)

    const bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: name,
      version: VERSION
    })

    bot.once("spawn", () => {
      console.log(name, "spawned")

      setTimeout(() => {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
        bot.chat(`/login ${PASSWORD}`)

        setTimeout(() => {
          bot.chat(MESSAGE)

          setTimeout(() => {
            bot.quit()
          }, 2000)

        }, 2000)

      }, 2000)
    })

    bot.on("end", () => {
      console.log(name, "disconnected")
      resolve()
    })

    bot.on("error", err => {
      console.log(name, "error:", err.message)
    })
  })
}

async function run() {
  for (let i = 0; i < 3; i++) {
    const name = randomName()
    await createBot(name)
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log("All bots finished.")
  process.exit(0)
}

run()
