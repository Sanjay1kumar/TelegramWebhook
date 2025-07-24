const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ✅ Use your Salesforce Public Site URL — NOT lightning.force.com
const SALESFORCE_ENDPOINT = 'https://kristhunandusahodarulusahavasam--sanjay.sandbox.my.site.com/BICFD/services/apexrest/SaveTelegramChatId';
const SECRET_KEY = 'MySecret123'; // Must match in Apex

app.post('/webhook', async (req, res) => {
    const message = req.body.message;
    if (!message || !message.chat) return res.sendStatus(400);

    const chatId = message.chat.id;
    const username = message.chat.username || '';
    const firstName = message.chat.first_name || '';
    const lastName = message.chat.last_name || '';

    try {
        const response = await axios.post(SALESFORCE_ENDPOINT, {
            chatId,
            username,
            firstName,
            lastName,
            secret: SECRET_KEY
        });

        console.log('Salesforce response:', response.data);
        res.sendStatus(200);
    } catch (error) {
        if (error.response) {
            console.error('Salesforce Error:', error.response.status, error.response.data);
        } else {
            console.error('Unknown Error:', error.message);
        }
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Telegram webhook server running on port ${PORT}`);
});
