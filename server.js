// telegramWebhook.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SALESFORCE_ENDPOINT = 'https://kristhunandusahodarulusahavasam--sanjay.sandbox.lightning.force.com/services/apexrest/SaveTelegramChatId'; // Your Apex REST
const SECRET_KEY = 'MySecret123'; // Use same in Apex class

app.post('/webhook', async (req, res) => {
    const message = req.body.message;
    if (!message || !message.chat) return res.sendStatus(400);

    const chatId = message.chat.id;
    const username = message.chat.username || '';
    const firstName = message.chat.first_name || '';
    const lastName = message.chat.last_name || '';

    try {
        await axios.post(SALESFORCE_ENDPOINT, {
            chatId,
            username,
            firstName,
            lastName,
            secret: SECRET_KEY
        });
        res.sendStatus(200);
    } catch (error) {
        console.error('Error sending to Salesforce:', error.message);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
