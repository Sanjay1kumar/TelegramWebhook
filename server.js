const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const TELEGRAM_BOT_TOKEN = '7549463850:AAED8KKkbO6htk0aqJi_eCLVGYpppce1Yyk';
const SALESFORCE_ENDPOINT = 'https://kristhunandusahodarulusahavasam--sanjay.sandbox.my.salesforce.com/services/apexrest/SaveTelegramChatId';

app.post('/webhook', async (req, res) => {
    const msg = req.body.message;

    if (msg && msg.chat && msg.from) {
        const chatId = msg.chat.id;
        const name = msg.from.first_name || '';
        const phone = msg.contact ? msg.contact.phone_number : null;

        try {
            await axios.post(SALESFORCE_ENDPOINT, {
                phone: phone,
                chatId: chatId,
                name: name,
                secret: 'MySecret123' // Must match with the Apex class
            });

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Hi ${name}, you're now connected with our Telegram services! ✅`
            });
        } catch (error) {
            console.error('Salesforce sync failed:', error.message);
        }
    }

    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Telegram webhook server running on port 3000');
});
