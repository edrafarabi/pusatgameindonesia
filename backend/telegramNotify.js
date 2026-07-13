const https = require('https');

// Telegram Bot Config
// Ganti dengan bot token PusatGameIndonesia (bukan Hermes bot)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8824481035:AAEHהתייחס';

/**
 * Kirim pesan Telegram
 * @param {string} chatId - Chat ID tujuan
 * @param {string} text - Pesan (HTML format)
 */
async function sendTelegram(chatId, text) {
    return new Promise((resolve, reject) => {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const body = JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.ok) resolve(result);
                    else reject(new Error(result.description));
                } catch(e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/**
 * Kirim notif ke user berdasarkan telegram username
 * @param {string} telegram - Username telegram (format: @username atau 08xxx)
 * @param {string} text - Pesan
 */
async function notifyUser(telegram, text) {
    if (!telegram || telegram === '') return;
    
    // Jika format @username, kita perlu chat_id
    // Untuk sementara, kita simpan dan kirim ke admin dulu
    try {
        // Kirim ke admin (chat_id dari env)
        const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
        if (adminChatId) {
            await sendTelegram(adminChatId, text);
        }
    } catch(e) {
        console.error('Telegram notify error:', e.message);
    }
}

/**
 * Kirim notif transaksi baru ke admin
 */
async function notifyNewTransaction(transaction, buyer, product) {
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (!adminChatId) return;

    const text = `🔔 <b>TRANSAKSI BARU!</b>\n\n` +
        `📦 <b>${product.title}</b>\n` +
        `💰 Rp${transaction.amount.toLocaleString()}\n` +
        `👤 Buyer: ${buyer.name}\n` +
        `📱 WA: ${buyer.whatsapp || '-'}\n` +
        `✈️ Telegram: ${buyer.telegram || '-'}\n\n` +
        `🆔 <code>${transaction.id}</code>\n` +
        `📊 Status: ${transaction.status}\n\n` +
        `<a href="https://kasirindisiniaja.my.id/chat/${transaction.id}">💬 Buka Chat Rekber</a>`;

    try {
        await sendTelegram(adminChatId, text);
    } catch(e) {
        console.error('Notify new transaction error:', e.message);
    }
}

/**
 * Kirim notif chat baru ke admin
 */
async function notifyNewChat(transactionId, senderName, message) {
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (!adminChatId) return;

    const text = `💬 <b>PESAN BARU</b>\n\n` +
        `👤 ${senderName}\n` +
        `📝 ${message.substring(0, 200)}\n\n` +
        `🆔 <code>${transactionId}</code>\n\n` +
        `<a href="https://kasirindisiniaja.my.id/chat/${transactionId}">💬 Balas</a>`;

    try {
        await sendTelegram(adminChatId, text);
    } catch(e) {
        console.error('Notify new chat error:', e.message);
    }
}

module.exports = { sendTelegram, notifyUser, notifyNewTransaction, notifyNewChat };
