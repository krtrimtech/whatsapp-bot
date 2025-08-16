// index.js
require('dotenv').config();
const venom = require('venom-bot');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const {
  N8N_WEBHOOK_URL,
  API_SECRET_KEY,
  BOT_SESSION_NAME,
  PORT
} = process.env;
const BEARER_TOKEN = process.env.API_BEARER_TOKEN;


// Store global session client
let venomClient;

// Start Venom session
venom
  .create({
    session: BOT_SESSION_NAME,
    multidevice: true,
    headless: true // optional, set false to see browser
  },
  (base64Qrimg, asciiQR, attempts, urlCode) => {
    // Output the ASCII QR in console for quick scan
    console.log(asciiQR);
    // You can optionally serve QR image via HTTP if needed
  })
  .then(client => startBot(client))
  .catch(e => {
    console.error('Venom error:', e);
  });
// Middleware for Bearer auth
function authBearerMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== BEARER_TOKEN) {
    return res.status(403).json({ success: false, error: 'Invalid bearer token' });
  }
  next();
}
// Bot logic
function startBot(client) {
  venomClient = client;

  client.onMessage(async message => {
    // Respond to all incoming messages
    if (message.isGroupMsg === false) {
      // Optionally send POST to n8n
      try {
        await axios.post(N8N_WEBHOOK_URL, {
          from: message.from,
          body: message.body
        }, {
          headers: { "X-API-KEY": API_SECRET_KEY }
        });
      } catch(err) {
        console.error('Failed posting to n8n:', err.message);
      }

      // Echo back message (customize as needed)
      client.sendText(message.from, 'Received: ' + message.body);
    }
  });
}

// Use Bearer auth for /webhook/send-message
app.post('/webhook/send-message', authBearerMiddleware, async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, error: 'Missing parameters.' });
  }

  if (!venomClient) {
    return res.status(500).json({ success: false, error: 'WhatsApp not yet initialized.' });
  }

  try {
    await venomClient.sendText(to, message);
    res.json({ success: true, status: 'Message sent!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Optional: serve QR code HTTP endpoint (if needed)

/*
app.get('/qr', (req, res) => {
  // Not implemented here, you can integrate logic to share QR code image
});
*/

app.listen(PORT || 3000, () => {
  console.log('Bot HTTP server running on port', PORT);
});
