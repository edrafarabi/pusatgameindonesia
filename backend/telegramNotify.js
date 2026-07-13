const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let tokenValid = null; // null = unchecked, true/false = checked

async function sendTelegram(chatId, text) {
    if (!BOT_TOKEN || !chatId) return;
    if (tokenValid === false) return; // jangan spam kalau token invalid

    return new Promise((resolve, reject) => {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });
        const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.ok) { tokenValid = true; resolve(result); }
                    else { tokenValid = false; reject(new Error(result.description)); }
                } catch(e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function notifyNewTransaction(transaction, buyer, product) {
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (!adminChatId) return;
    const text = `🔔 <b>TRANSAKSI BARU!</b>\n\n📦 <b>${product.title}</b>\n💰 Rp${transaction.amount.toLocaleString()}\n👤 Buyer: ${buyer.name}\n🆔 <code>${transaction.id}</code>\n📊 Status: ${transaction.status}\n\n<a href="https://kasirindisiniaja.my.id/chat/${transaction.id}">💬 Buka Chat</a>`;
    try { await sendTelegram(adminChatId, text); } catch { /* silent */ }
}

async function notifyNewChat(transactionId, senderName, message) {
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (!adminChatId) return;
    const text = `💬 <b>PESAN BARU</b>\n\n👤 ${senderName}\n📝 ${message.substring(0, 200)}\n\n🆔 <code>${transactionId}</code>`;
    try { await sendTelegram(adminChatId, text); } catch { /* silent */ }
}

module.exports = { sendTelegram, notifyNewTransaction, notifyNewChat };
