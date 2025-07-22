const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
    const message = req.body.message;
    if (message && message.chat && message.chat.id) {
        const chatId = message.chat.id;
        const name = message.from.first_name;
        console.log(`Chat ID: ${chatId} from ${name}`);
    }
    res.sendStatus(200);
});

const PORT = 10080;
app.listen(PORT, () => {
    console.log(`Telegram webhook server running on port ${PORT}`);
});
