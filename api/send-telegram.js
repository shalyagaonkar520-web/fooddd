const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export default async function handler(req, res) {
  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS restriction
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const requestOrigin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin === '*' ? (requestOrigin || '*') : allowedOrigin);
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

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Server Configuration Error: TELEGRAM_BOT_TOKEN env var is missing.');
      return res.status(500).json({
        success: false,
        error: 'Notification service unavailable',
        correlationId: `err_tg_cfg_${Date.now().toString(36)}`
      });
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
        } else {
          console.warn('Telegram API warning for chat [REDACTED]:', tgData?.description || 'Failed');
        }
      } catch (e) {
        console.error('Telegram dispatch error for chat [REDACTED]:', e);
      }
    }

    if (sentCount > 0) {
      return res.status(200).json({ success: true, sentCount });
    } else {
      return res.status(502).json({
        success: false,
        error: 'Failed to deliver notification message',
        correlationId: `err_tg_send_${Date.now().toString(36)}`
      });
    }
  } catch (err) {
    const correlationId = `err_${Date.now().toString(36)}`;
    console.error(`[${correlationId}] Telegram Handler Exception:`, err);
    return res.status(500).json({
      success: false,
      error: 'An internal notification error occurred.',
      correlationId
    });
  }
}
