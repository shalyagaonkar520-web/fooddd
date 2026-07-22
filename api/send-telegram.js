const TELEGRAM_BOT_TOKEN = '8410372745:AAFSmmk7sBujLmfI0QZFAg_Qh-qZwhKnmxM';
const CHAT_IDS = ['1750770370', '-1003803637741'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let text;
    let customChatId;

    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        text = parsed.text;
        customChatId = parsed.chat_id;
      } catch (e) {}
    } else if (req.body && typeof req.body === 'object') {
      text = req.body.text;
      customChatId = req.body.chat_id;
    }

    if (!text) {
      return res.status(400).json({ error: 'Missing message text' });
    }

    const targets = customChatId ? [customChatId] : CHAT_IDS;
    let sentCount = 0;
    let lastError = null;

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
        } else {
          lastError = tgData.description || 'Failed to send to chat';
          console.warn(`Telegram API error for chat ${chatId}:`, tgData);
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (sentCount > 0) {
      return res.status(200).json({ success: true, sentCount });
    } else {
      return res.status(502).json({ success: false, error: lastError || 'All Telegram sends failed' });
    }
  } catch (err) {
    console.error('Telegram send failed:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
