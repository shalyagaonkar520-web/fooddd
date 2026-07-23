import { Handler } from '@netlify/functions';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const text = payload.text;
    const customChatId = payload.chat_id;

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing message text' })
      };
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Telegram bot token not configured in environment variables' })
      };
    }

    const targets = customChatId ? [customChatId] : CHAT_IDS;
    let sentCount = 0;

    for (const chatId of targets) {
      try {
        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
          })
        });

        const tgData = await tgResponse.json();
        if (tgResponse.ok && tgData.ok) {
          sentCount++;
        }
      } catch (e) {}
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: sentCount > 0, sentCount })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || 'Internal server error' })
    };
  }
};
