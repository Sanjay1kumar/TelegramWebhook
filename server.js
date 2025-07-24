const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const SF_LOGIN_URL = 'https://login.salesforce.com'; // or test.salesforce.com for sandbox
const CLIENT_ID = '3MVG9dAEux2v1sLs.EoklfvcvXUV0um4mEXUQ7dVGkmjBs4yRriBtKecJ1RtDw8VB0OdTCwFIVjhmEWZ2Jwqc';
const CLIENT_SECRET = '953DC3CF45C3CEE081B6CA5E4792A69A8B3AFE094BD96F0A368F1CE3FF14BCAE';
const SF_USERNAME = 'stylishmidde9618624@agentforce.com';
const SF_PASSWORD = 'Sanjaykumar@123';
const APEX_REST_ENDPOINT = 'orgfarm-b435e89db1-dev-ed.develop.my.salesforce.com/services/apexrest/SaveTelegramChatId';

async function getAccessToken() {
    const response = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`, null, {
        params: {
            grant_type: 'password',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            username: SF_USERNAME,
            password: SF_PASSWORD
        }
    });
    return response.data.access_token;
}

app.post('/webhook', async (req, res) => {
    const msg = req.body.message;
    if (!msg || !msg.chat || !msg.from) return res.sendStatus(400);

    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const username = msg.chat.username || '';

    try {
        const token = await getAccessToken();

        const response = await axios.post(APEX_REST_ENDPOINT, {
            chatId,
            username,
            firstName,
            lastName,
            secret: 'MySecret123'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Salesforce response:', response.data);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        res.sendStatus(500);
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));
