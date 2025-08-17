# README: WhatsApp Bot Setup on Google Cloud VM

## Overview

This README walks you through:
- **Spinning up a Google Cloud VM**
- **SSH access**
- **Installing Node.js, npm, and PM2**
- **Installing Google Chrome (headless) for Venom**
- **Setting up a secure user for the bot**
- **Deploying and running [krtrimtech/whatsapp-bot](https://github.com/krtrimtech/whatsapp-bot)**

---

## Prerequisites

- Google Cloud account and project  
- Ubuntu 20.04+/22.04 VM (recommended)  
- SSH terminal access  

---

## 1. Create Your VM on Google Cloud

1. Go to **Compute Engine > VM instances > CREATE INSTANCE**  
2. Use **Ubuntu 22.04 LTS** as your boot image.  
3. Pick machine settings (e2-micro is fine for light use).  
4. Allow HTTP/HTTPS as desired.  
5. Launch your VM.

---

## 2. Connect via SSH

From the Google Cloud console, click “SSH” next to your new VM.

Or, in your terminal:

```bash

gcloud compute ssh <INSTANCE_NAME> --zone <ZONE>

```

---

## 3. System Update & Base Tools

```bash

sudo apt update \&\& sudo apt upgrade -y
sudo apt install wget git -y

```

---

## 4. Install Node.js & npm

```bash

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v

```

---

## 5. Install PM2

```bash

sudo npm install -g pm2

```

---

## 6. Install Google Chrome (Headless)

Venom Bot requires a Chromium/Chrome browser. Here's the best-practice way for Ubuntu 22.04:

```bash


# Add Google Linux signing key

sudo wget -qO /etc/apt/trusted.gpg.d/google_linux_signing_key.asc https://dl.google.com/linux/linux_signing_key.pub

# Add Chrome repository

echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Install Chrome

sudo apt update
sudo apt install -y google-chrome-stable

# Check version

google-chrome --version

```

Chrome runs in headless mode by default on servers, perfect for automation needs.

---

## 7. (Recommended) Create Dedicated User

Enhances security by avoiding root use.

```bash

sudo adduser whatsappbot
sudo usermod -aG sudo whatsappbot
su - whatsappbot

```

---

## 8. Clone and Prepare the Bot

```bash

git clone https://github.com/krtrimtech/whatsapp-bot.git ~/whatsapp-bot
cd ~/whatsapp-bot
npm install

```

---

## 9. Configure the Bot

Create your `.env` file as needed:

```bash

cp .env.test .env
nano .env

```

Example content:

```bash

N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/whatsapp-incoming
API_SECRET_KEY=yoursecretkey
API_BEARER_TOKEN=your_super_secret_token
BOT_SESSION_NAME=whatsapp-bot
PORT=3000

```

Adjust values for your environment.

---

## 10. Launch the Bot with PM2

```bash

pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup

```

_Follow the output instructions to finish PM2’s auto-start setup._

---

## 11. Link WhatsApp

- The first run prints a QR code to your SSH terminal.  
- Open WhatsApp → Menu → Linked Devices → Link a Device, and scan the QR code.

---

## 12. Chrome Permissions (if needed)

If Venom gives errors launching the browser, ensure your user can access the Chrome binary. You may need to set the path in bot options, for example:

```js

// inside your venom.create() options:
{
browserPathExecutable: '/usr/bin/google-chrome'
}

```

---

## 13. PM2 Cheatsheet

- `pm2 list` — List all processes  
- `pm2 logs whatsapp-bot` — Tail logs  
- `pm2 restart whatsapp-bot` — Restart  
- `pm2 stop whatsapp-bot` — Stop  
- `pm2 delete whatsapp-bot` — Remove from PM2  

---

## Notes

- Do not run Venom Bot as root—use a dedicated user for best stability and security.  
- For Chrome custom settings, ensure your Venom options or puppeteer args (in your codebase) allow headless operation if running on a server.  
- Adjust and secure environment variables as needed.

---

Your Venom WhatsApp bot is now set up and ready to run on your Google Cloud VM with browser support!




### Sponsor

If you'd like to support this project, please consider sponsoring us!
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?logo=githubsponsors)](#)

**Visit our website:** [https://krtirm.tech](https://krtirm.tech)
## [![Follow on Facebook](https://img.shields.io/badge/Follow-Facebook-blue?logo=facebook)](https://www.facebook.com/krtrim.py/)