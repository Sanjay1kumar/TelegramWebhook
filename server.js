const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 🔧 Replace with your actual values:
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // <-- replace
const SALESFORCE_ENDPOINT = 'https://YOUR_SITE.force.com/services/apexrest/SaveTelegramChatId'; // <-- replace
const SECRET_KEY = 'MySecret123'; // must match Apex class

// 📬 Telegram webhook endpoint
app.post('/webhook', async (req, res) => {
    const msg = req.body.message;
    console.log('Received Telegram message:', JSON.stringify(req.body));

    if (msg && msg.chat && msg.from) {
        const chatId = msg.chat.id;
        const name = msg.from.first_name || '';
        const phone = msg.contact ? msg.contact.phone_number : null;

        // ❌ If phone is not shared yet, ask user to send it
        if (!phone) {
            console.log('No phone number — asking user to share contact');
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Hi ${name}, please share your phone number to connect your account.`,
                reply_markup: {
                    keyboard: [[{
                        text: "📱 Share My Phone Number",
                        request_contact: true
                    }]],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
            return res.sendStatus(200);
        }

        // ✅ User shared phone number — send to Salesforce
        try {
            console.log('Sending to Salesforce:', { phone, chatId, name });

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
            console.error('Salesforce sync failed:', error.response?.data || error.message);

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `❌ Sorry ${name}, there was a problem linking your account. Please try again later.`
            });
        }
    }

    res.sendStatus(200);
});

// ✅ Optional homepage
app.get('/', (req, res) => {
    res.send('✅ Telegram Webhook Server is live');
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Telegram webhook server running on port ${PORT}`);
});
