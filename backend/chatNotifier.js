// chatNotifier.js — Kirim pesan notifikasi ke group chat
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');

/**
 * Kirim pesan notifikasi ke group chat berdasarkan transaction_id
 * @param {string} transactionId
 * @param {string} message
 */
function notifyGroupChat(transactionId, message) {
    db.get('SELECT id FROM chat_groups WHERE transaction_id = ?', [transactionId], (err, group) => {
        if (err || !group) return;
        db.run('INSERT INTO chat_messages (transaction_id, group_id, sender_id, message) VALUES (?, ?, ?, ?)',
            [transactionId, group.id, 0, message], (err2) => {
                if (err2) console.error('Notify error:', err2.message);
            });
    });
}

module.exports = { notifyGroupChat };
