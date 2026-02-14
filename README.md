# 🤖 Eagler Bot Army

A lightweight, stealthy Mineflayer-based bot script optimized for deployment on **Railway**.

## 🛠️ Configuration
Edit the `CONFIG` object in `index.js` directly:

| Variable | Description |
| :--- | :--- |
| `host` | The **Java IP** of the server (not wss://). |
| `botCount` | Number of bots per IP (Recommended: 3 or 4). |
| `joinDelay` | 45s+ delay to trick "Recent Join" IP filters. |
| `verifyDelay` | 7s delay to bypass TCPShield without "Too Fast" kicks. |
| `spamInterval` | Time between random hex messages. |

## 🛡️ Stealth Features
- **TCPShield Re-Connect:** Detects the "verified" kick message and rejoins with the *same name* to bypass verification.
- **Physics Disabled:** Reduces the network packet footprint to look less suspicious to firewalls.
- **Random Hex Spam:** Sends random alphanumeric strings (e.g., `A4F2B9`) to mimic encrypted traffic and bypass word-based anti-spam.
- **Anti-AFK Jump:** Bots jump every 20 seconds to prevent lobby timeout kicks.

## 📦 Installation
1. **Repository:** Ensure `index.js` and `package.json` are in the root folder.
2. **Dependencies:** 
   ```json
   "dependencies": {
     "mineflayer": "^4.20.0"
   }
