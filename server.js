const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const TELEGRAM_BOT_TOKEN = '7549463850:AAED8KKkbO6htk0aqJi_eCLVGYpppce1Yyk'; // Replace with your bot token
const SALESFORCE_ENDPOINT = 'https://kristhunandusahodarulusahavasam--sanjay.cs88.force.com/services/apexrest/SaveTelegramChatId'; // Replace with your Site URL

const SECRET_KEY = 'MySecret123'; // Must match the Apex class secret

app.post('/webhook', async (req, res) => {
    const msg = req.body.message;

    console.log('Received Telegram message:', JSON.stringify(req.body));

    if (msg && msg.chat && msg.from) {
        const chatId = msg.chat.id;
        const name = msg.from.first_name || '';
        const phone = msg.contact ? msg.contact.phone_number : null;

        if (!phone) {
            console.log('No phone number received — user must share contact.');
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Hi ${name}, please share your phone number using the Telegram contact button to connect your account.`
            });
            return res.sendStatus(200);
        }

        try {
            // Log before sending
            console.log('Sending to Salesforce:', {
                phone, chatId, name
            });

            const response = await axios.post(SALESFORCE_ENDPOINT, {
                phone: phone,
                chatId: chatId,
                name: name,
                secret: SECRET_KEY
            });

            console.log('Salesforce response:', response.data);

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Hi ${name}, your Telegram has been linked successfully with our system ✅`
            });

        } catch (error) {
            console.error('Error sending to Salesforce:', error.response?.data || error.message);

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `❌ Sorry ${name}, there was a problem linking your account. Please try again later.`
            });
        }
    }

    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send('Telegram Webhook Server is running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Telegram webhook server running on port ${PORT}`);
});
