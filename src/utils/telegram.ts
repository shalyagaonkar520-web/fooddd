const TELEGRAM_BOT_TOKEN = '8410372745:AAFSmmk7sBujLmfI0QZFAg_Qh-qZwhKnmxM';
const CHAT_IDS = ['1750770370', '-1003803637741'];

export const sendTelegramMessage = async (text: string): Promise<void> => {
  try {
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.success) return;
    }
  } catch (e) {}

  // Fallback to direct Telegram API calls to all target chat IDs
  for (const chatId of CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });
    } catch (err) {
      console.error(`Failed to send Telegram notification to ${chatId}:`, err);
    }
  }
};

export const sendHotelStatusNotification = async (order: any, status: string, cancelReason?: string) => {
  if (!order) return;

  const orderId = order.id ? order.id.slice(0, 8) : 'N/A';
  const itemsText = order.items
    ? order.items.map((item: any) => `• ${item.quantity || 1}x ${item.name}`).join('\n')
    : 'N/A';

  let statusHeader = '';
  if (status === 'Preparing') {
    statusHeader = '👨‍🍳 <b>ORDER PREPARING (Kitchen Accepted)</b>';
  } else if (status === 'Ready for Delivery') {
    statusHeader = '📦 <b>ORDER READY FOR DELIVERY (Marked by Kitchen)</b>';
  } else if (status === 'Cancelled') {
    statusHeader = `❌ <b>ORDER CANCELLED BY KITCHEN</b>\nReason: ${cancelReason || 'Kitchen Cancelled'}`;
  } else {
    statusHeader = `🔔 <b>ORDER STATUS UPDATE: ${status}</b>`;
  }

  const message = `${statusHeader}

<b>Order ID:</b> #${orderId}
<b>Customer:</b> ${order.userName || 'Customer'} (${order.userPhone || 'N/A'})
<b>Items:</b>
${itemsText}
${order.instructions ? `\n<b>Notes:</b> ${order.instructions}` : ''}
<b>Total:</b> ₹${order.grandTotal || 0}
<b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  await sendTelegramMessage(message);
};

export const sendTelegramOrderNotification = async (order: any) => {
  if (!order) return;

  const itemsText = order.items
    ? order.items.map((item: any) => `• ${item.quantity || 1}x ${item.name} (₹${item.price})`).join('\n')
    : 'N/A';

  const message = `🚨 <b>NEW ORDER RECEIVED</b> 🚨

<b>Order ID:</b> #${order.id ? order.id.slice(0, 8) : 'N/A'}
<b>Customer:</b> ${order.userName || 'Customer'} (${order.userPhone || 'N/A'})
<b>Address:</b> ${order.deliveryLocation?.address || order.address || 'Self Pickup'}

<b>Order Items:</b>
${itemsText}

💰 <b>Grand Total: ₹${order.grandTotal || 0}</b>
${order.instructions ? `📝 <b>Notes:</b> ${order.instructions}\n` : ''}
🕒 <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  await sendTelegramMessage(message);
};
