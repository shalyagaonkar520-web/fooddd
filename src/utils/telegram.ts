export const sendTelegramOrderNotification = async (order: any) => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram Bot Token or Chat ID is missing. Notification not sent.");
    return;
  }

  // Format order items
  const itemsText = order.items
    .map((item: any) => `${item.quantity || 1}x ${item.name} (₹${item.price})`)
    .join('\n');

  // Format the full message
  const text = `🚨 *NEW ORDER RECEIVED* 🚨
Order ID: #${order.id.slice(0, 8)}

*Customer Info:*
👤 Name: ${order.userName}
📞 Phone: ${order.userPhone}
📍 Address: ${order.deliveryLocation?.address || 'Self Pickup'}

*Order Details:*
${itemsText}

💰 *Grand Total: ₹${order.grandTotal}*
📝 Notes: ${order.instructions || 'None'}

🕒 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Telegram notification:', errorData);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};
