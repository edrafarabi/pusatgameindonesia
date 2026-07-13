const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const cron = require('node-cron');
const { notifyNewTransaction, notifyNewChat } = require('./telegramNotify');
require('dotenv').config();

const adminRoutes = require('./adminRoutes');
const productRoutes = require('./productRoutes');

// Helper: kirim pesan notifikasi ke group chat
function notifyGroupChat(transactionId, message, senderId = 0) {
    db.get('SELECT id FROM chat_groups WHERE transaction_id = ?', [transactionId], (err, group) => {
        if (err || !group) return;
        db.run('INSERT INTO chat_messages (transaction_id, group_id, sender_id, message) VALUES (?, ?, ?, ?)',
            [transactionId, group.id, senderId, message]);
    });
}

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://kasirindisiniaja.my.id',
  'https://kasirindisiniaja.my.id',
];

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET tidak ditemukan di .env');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Terlalu banyak request, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (!err) {
        db.run('PRAGMA journal_mode = WAL;', (walErr) => {
            if (walErr) {
                console.error('❌ Gagal aktifkan WAL mode:', walErr.message);
            } else {
                console.log('💾 SQLite WAL mode aktif');
            }
        });
    }
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Database connected');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'BUYER',
        phone TEXT DEFAULT '',
        telegram TEXT DEFAULT '',
        whatsapp TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        type TEXT NOT NULL,
        buyer_id INTEGER,
        seller_id INTEGER,
        amount INTEGER,
        status TEXT DEFAULT 'WAITING_PAYMENT',
        payment_proof TEXT DEFAULT '',
        payment_method TEXT DEFAULT '',
        cancel_reason TEXT DEFAULT '',
        delivery_note TEXT DEFAULT '',
        group_id INTEGER,
        platform_fee INTEGER DEFAULT 0,
        seller_amount INTEGER DEFAULT 0,
        escrow_released INTEGER DEFAULT 0,
        dispute_reason TEXT DEFAULT '',
        rating INTEGER DEFAULT 0,
        review TEXT DEFAULT '',
        buyer_info TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        delivered_at DATETIME,
        completed_at DATETIME,
        cancelled_at DATETIME,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        seller_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        game_name TEXT,
        price INTEGER NOT NULL,
        stock INTEGER DEFAULT 1,
        images TEXT DEFAULT '',
        specs TEXT DEFAULT '',
        status TEXT DEFAULT 'ACTIVE',
        rating REAL DEFAULT 5.0,
        sold_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get('SELECT * FROM users WHERE email = ?', ['akunbaruedra@gmail.com'], (err, row) => {
        if (!row) {
            const defaultPass = 'edra123';
            bcrypt.hash(defaultPass, 10, (hashErr, hash) => {
                if (!hashErr) {
                    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        ['Edra Wira', 'akunbaruedra@gmail.com', hash, 'SUPERADMIN']);
                    console.log('✅ SUPERADMIN created (password: edra123)');
                }
            });
        } else {
            db.run('UPDATE users SET role = \"SUPERADMIN\" WHERE email = ?', ['akunbaruedra@gmail.com']);
        }
    });

    // Chat Messages Table
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        group_id INTEGER,
        sender_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
    )`);

    // Chat Groups Table (Rekber)
    db.run(`CREATE TABLE IF NOT EXISTS chat_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )`);

    // Chat Group Members Table
    db.run(`CREATE TABLE IF NOT EXISTS chat_group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES chat_groups(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Add payment_proof column if missing
    db.all("PRAGMA table_info(transactions)", (err, cols) => {
        const colNames = (cols || []).map(c => c.name);
        if (!colNames.includes('payment_proof')) {
            db.run('ALTER TABLE transactions ADD COLUMN payment_proof TEXT DEFAULT ""');
        }
        if (!colNames.includes('delivery_note')) {
            db.run('ALTER TABLE transactions ADD COLUMN delivery_note TEXT DEFAULT ""');
        }
        if (!colNames.includes('group_id')) {
            db.run('ALTER TABLE transactions ADD COLUMN group_id INTEGER');
        }
        if (!colNames.includes('paid_at')) {
            db.run('ALTER TABLE transactions ADD COLUMN paid_at TEXT');
        }
    });

    // Add balance column to users if missing
    db.all("PRAGMA table_info(users)", (err, cols) => {
        const colNames = (cols || []).map(c => c.name);
        if (!colNames.includes('balance')) {
            db.run('ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 0');
        }
    });

    // Withdraw requests table
    db.run(`CREATE TABLE IF NOT EXISTS withdraw_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        method TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    const defaultSettings = [
        ['site_name', 'PusatGameIndonesia'],
        ['site_description', 'Marketplace Jual Beli Akun & Item Game Indonesia'],
        ['contact_email', 'akunbaruedra@gmail.com'],
        ['rekber_fee_percent', '2.5'],
        ['minimum_fee', '2000'],
        ['payment_methods', 'DANA,GoPay,OVO,Transfer Bank,QRIS'],
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    defaultSettings.forEach(([key, value]) => stmt.run(key, value));
    stmt.finalize();
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup multer untuk upload multiple file
const upload = multer({ dest: '/tmp/uploads/' });

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Akses ditolak, token hilang' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid' });
        req.user = user;
        next();
    });
};

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone, telegram, whatsapp } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Lengkapi semua field' });
    }
    bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) return res.status(500).json({ error: 'Gagal hash password' });
        db.run('INSERT INTO users (name, email, password, phone, telegram, whatsapp, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, hash, phone || '', telegram || '', whatsapp || '', 'BUYER'],
            function(err) {
                if (err) return res.status(400).json({ error: 'Email sudah terdaftar' });
                res.json({ message: 'Pendaftaran berhasil! Silakan login.' });
            }
        );
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Email atau password salah' });
        bcrypt.compare(password, user.password, (compareErr, match) => {
            if (compareErr || !match) return res.status(400).json({ error: 'Email atau password salah' });
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, telegram: user.telegram, whatsapp: user.whatsapp }
            });
        });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role, phone, telegram, whatsapp, bio, avatar, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'User tidak ditemukan' });
            res.json(row);
        }
    );
});

app.get('/api/users/stats', authenticateToken, (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as count FROM transactions WHERE buyer_id = ?', [req.user.id], (e1, r1) => {
        stats.buyer_transactions = r1 ? r1.count : 0;
        db.get('SELECT COUNT(*) as count FROM transactions WHERE seller_id = ?', [req.user.id], (e2, r2) => {
            stats.seller_transactions = r2 ? r2.count : 0;
            db.get('SELECT COUNT(*) as count FROM products WHERE seller_id = ?', [req.user.id], (e3, r3) => {
                stats.products_listed = r3 ? r3.count : 0;
                db.get('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE buyer_id = ? AND status = "COMPLETED"', [req.user.id], (e4, r4) => {
                    stats.total_spent = r4 ? r4.total : 0;
                    res.json(stats);
                });
            });
        });
    });
});

// Get user balance (escrow wallet)
app.get('/api/auth/balance', authenticateToken, (req, res) => {
    db.get('SELECT COALESCE(balance, 0) as balance, COALESCE(total_earned, 0) as total_earned FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'User tidak ditemukan' });
            res.json({ balance: row.balance || 0, total_earned: row.total_earned || 0 });
        }
    );
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const { phone, telegram, whatsapp, bio, avatar } = req.body;
    db.run(
        'UPDATE users SET phone = ?, telegram = ?, whatsapp = ?, bio = ?, avatar = ? WHERE id = ?',
        [phone || '', telegram || '', whatsapp || '', bio || '', avatar || '', req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Gagal update profil' });
            res.json({ message: 'Profil berhasil diperbarui' });
        }
    );
});

// ==========================================
// 🔄 UPGRADE KE SELLER
// ==========================================
app.post('/api/auth/upgrade-seller', authenticateToken, (req, res) => {
    const { telegram } = req.body;
    
    if (!telegram || telegram.trim().length < 3) {
        return res.status(400).json({ error: 'Telegram wajib diisi (minimal 3 karakter)' });
    }
    
    db.get('SELECT role, telegram FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User tidak ditemukan' });
        
        if (user.role === 'SELLER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
            return res.status(400).json({ error: 'Kamu sudah menjadi seller' });
        }
        
        db.run(
            'UPDATE users SET role = ?, telegram = ? WHERE id = ?',
            ['SELLER', telegram.trim(), req.user.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal upgrade akun' });
                
                // Return updated user
                db.get('SELECT id, name, email, role, phone, telegram, whatsapp FROM users WHERE id = ?', [req.user.id], (err3, updated) => {
                    res.json({ 
                        message: 'Berhasil menjadi seller! Kamu sekarang bisa jual produk.',
                        user: updated
                    });
                });
            }
        );
    });
});

// Upload multiple gambar → ke Catbox.moe
app.post('/api/upload/images', authenticateToken, upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Tidak ada file yang diupload' });
        }

        const filePaths = req.files.map(f => f.path);
        const urls = await uploadMultipleToCatbox(filePaths);

        // Cleanup temp files
        for (const f of req.files) {
            try { fs.unlinkSync(f.path); } catch(e) {}
        }

        if (urls.length === 0) {
            return res.status(500).json({ error: 'Gagal upload ke Catbox' });
        }

        res.json({ success: true, urls });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Gagal upload gambar' });
    }
});

// ==========================================
// 💰 SISTEM REKBER MANUAL (Group Chat)
// Flow: Buyer Beli → Group Chat Dibuat (Buyer + Seller + Admin) → Admin Handle
// ==========================================

// Helper: buat group chat untuk transaksi
function createRekberGroup(transactionId, buyerId, sellerId, adminId, callback) {
    const groupName = `Rekber ${transactionId}`;
    
    db.run('INSERT INTO chat_groups (transaction_id, name) VALUES (?, ?)', [transactionId, groupName], function(err) {
        if (err) return callback(err);
        const groupId = this.lastID;
        
        const members = [
            [groupId, buyerId, 'BUYER'],
            [groupId, sellerId, 'SELLER']
        ];
        
        const addGroupAndFinish = () => {
            const stmt = db.prepare('INSERT OR IGNORE INTO chat_group_members (group_id, user_id, role) VALUES (?, ?, ?)');
            members.forEach(m => stmt.run(m));
            stmt.finalize();
            
            db.run('INSERT INTO chat_messages (transaction_id, group_id, sender_id, message) VALUES (?, ?, ?, ?)',
                [transactionId, groupId, 0, `🔒 Group rekber dibuat. Transaksi ${transactionId} menunggu pembayaran.`]);
            
            callback(null, groupId);
        };
        
        if (adminId) {
            // Buyer pilih admin spesifik
            members.push([groupId, adminId, 'ADMIN']);
            addGroupAndFinish();
        } else {
            // Fallback: add semua admin
            db.all('SELECT id FROM users WHERE role IN ("SUPERADMIN","ADMIN")', [], (err2, admins) => {
                if (err2) return callback(err2);
                admins.forEach(admin => members.push([groupId, admin.id, 'ADMIN']));
                addGroupAndFinish();
            });
        }
    });
}

// Create transaction → auto buat group chat
app.post('/api/transaction/create', authenticateToken, (req, res) => {
    const { product_id, admin_id, buyer_info } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Produk diperlukan' });

    db.get('SELECT * FROM products WHERE id = ? AND status = "ACTIVE"', [product_id], (err, product) => {
        if (err || !product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        if (product.seller_id === req.user.id) return res.status(400).json({ error: 'Tidak bisa beli produk sendiri' });
        if (product.stock < 1) return res.status(400).json({ error: 'Stok habis' });

        const transactionId = `TRX-${Date.now()}`;
        const amount = product.price;

        // Hitung fee dari settings (dibayar buyer)
        db.get("SELECT value FROM settings WHERE key = 'rekber_fee_percent'", [], (errF, feeRow) => {
            db.get("SELECT value FROM settings WHERE key = 'minimum_fee'", [], (errM, minRow) => {
                const feePercent = feeRow ? parseFloat(feeRow.value) : 2.5;
                const minFee = minRow ? parseInt(minRow.value) : 2000;
                const rawFee = Math.round(amount * feePercent / 100);
                const platformFee = Math.max(rawFee, minFee);

                db.run(
                    `INSERT INTO transactions (id, product_id, type, buyer_id, seller_id, amount, status, platform_fee, buyer_info) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [transactionId, product_id, 'REKBER', req.user.id, product.seller_id, amount, 'WAITING_PAYMENT', platformFee, buyer_info || ''],
                    function(err) {
                        if (err) return res.status(500).json({ error: 'Gagal membuat transaksi' });
                        
                        // Reserve stok sekali; hanya jika stok > 0
                        db.run('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0', [product_id]);
                
                // Buat group chat otomatis
                createRekberGroup(transactionId, req.user.id, product.seller_id, admin_id, (err2, groupId) => {
                    if (err2) console.error('Gagal buat group:', err2);
                    
                    // Kirim notif Telegram ke admin
                    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (errU, buyer) => {
                        if (buyer) {
                            notifyNewTransaction(
                                { id: transactionId, amount, status: 'WAITING_PAYMENT' },
                                buyer,
                                product
                            ).catch(e => console.error('Notif error:', e.message));
                        }
                    });
                    
                    res.json({ 
                        id: transactionId, 
                        amount,
                        platform_fee: platformFee,
                        total: amount + platformFee,
                        group_id: groupId,
                        message: 'Transaksi dibuat. Group rekber sudah dibuat dengan admin.' 
                    });
                });
            }); // close db.run transactions
            }); // close db.get minimum_fee
        }); // close db.get rekber_fee_percent
    }); // close db.get products
}); // close app.post

// Buyer upload bukti bayar → status jadi PAID + notif ke group
app.put('/api/transaction/:id/pay', authenticateToken, (req, res) => {
    const { payment_method, payment_proof } = req.body;
    
    db.get('SELECT * FROM transactions WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'WAITING_PAYMENT') return res.status(400).json({ error: 'Transaksi sudah diproses' });

        db.run(
            `UPDATE transactions SET status = 'PAID', payment_method = ?, payment_proof = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [payment_method || '', payment_proof || '', req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal update pembayaran' });
                
                // Notifikasi ke group chat
                notifyGroupChat(req.params.id, `💰 BUYER TELAH BAYAR! Metode: ${payment_method || 'Transfer Bank'}. Menunggu seller kirim akun.`);
                
                res.json({ message: 'Pembayaran tercatat. Menunggu seller mengirim akun.' });
            }
        );
    });
});

// Seller kirim akun → status jadi DELIVERED
app.put('/api/seller/orders/:id/deliver', authenticateToken, (req, res) => {
    const { delivery_note } = req.body;
    
    db.get('SELECT * FROM transactions WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'PAID') return res.status(400).json({ error: 'Pembayaran belum diterima' });

        db.run(
            `UPDATE transactions SET status = 'DELIVERED', delivered_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal update status' });
                notifyGroupChat(req.params.id, "📦 SELLER TELAH KIRIM AKUN! Silakan buyer cek dan verifikasi akun.");
                res.json({ message: 'Akun berhasil dikirim. Menunggu buyer konfirmasi.' });
            }
        );
    });
});

// Buyer konfirmasi akun OK → COMPLETED, uang cair ke seller (dikurangi fee)
app.put('/api/transaction/:id/confirm', authenticateToken, (req, res) => {
    db.get('SELECT * FROM transactions WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'DELIVERED') return res.status(400).json({ error: 'Akun belum dikirim seller' });

        // Fee dibayar buyer, seller terima 100%
        const sellerGets = trx.amount;

        db.run(
            `UPDATE transactions SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, escrow_released = 1, platform_fee = ?, seller_amount = ? WHERE id = ?`,
            [trx.platform_fee || 0, sellerGets, req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal konfirmasi' });

                // Tambah saldo seller (100% harga, fee dibayar buyer)
                db.run('UPDATE users SET balance = balance + ?, total_earned = total_earned + ?, total_sales = total_sales + 1 WHERE id = ?', 
                    [sellerGets, sellerGets, trx.seller_id]);
                
                // Stok sudah di-reserve saat checkout; confirm hanya catat penjualan.
                db.run('UPDATE products SET sold_count = sold_count + 1, status = CASE WHEN stock <= 0 THEN "SOLD" ELSE status END WHERE id = ?', [trx.product_id]);

                notifyGroupChat(req.params.id, `✅ TRANSAKSI SELESAI! Buyer konfirmasi. Seller terima Rp${sellerGets.toLocaleString('id-ID')}`, req.user.id);

                res.json({ 
                    message: `Transaksi selesai! Seller menerima Rp${sellerGets.toLocaleString('id-ID')}`,
                    seller_received: sellerGets,
                    platform_fee: trx.platform_fee || 0
                });
            }
        );
    });
});

// Buyer ajukan dispute (masalah dengan akun)
app.put('/api/transaction/:id/dispute', authenticateToken, (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Alasan dispute diperlukan' });

    db.get('SELECT * FROM transactions WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'DELIVERED') return res.status(400).json({ error: 'Hanya bisa dispute setelah akun dikirim' });

        db.run(
            `UPDATE transactions SET status = 'DISPUTED', dispute_reason = ? WHERE id = ?`,
            [reason, req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal ajukan dispute' });
                res.json({ message: 'Dispute diajukan. Admin akan review.' });
            }
        );
    });
});

// Buyer kasih rating & review
app.put('/api/transaction/:id/review', authenticateToken, (req, res) => {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 diperlukan' });

    db.get('SELECT * FROM transactions WHERE id = ? AND buyer_id = ? AND status = "COMPLETED"', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan atau belum selesai' });

        db.run('UPDATE transactions SET rating = ?, review = ? WHERE id = ?', [rating, review || '', req.params.id], function(err2) {
            if (err2) return res.status(500).json({ error: 'Gagal simpan review' });

            // Update rating seller (rata-rata)
            db.get('SELECT AVG(t.rating) as avg_rating, COUNT(*) as total FROM transactions t WHERE t.seller_id = ? AND t.rating > 0', [trx.seller_id], (err3, row) => {
                if (row) {
                    db.run('UPDATE users SET rating = ? WHERE id = ?', [row.avg_rating || 5.0, trx.seller_id]);
                }
            });

            res.json({ message: 'Review berhasil disimpan' });
        });
    });
});

// Buyer bisa cancel kalau belum bayar
app.put('/api/transaction/:id/cancel', authenticateToken, (req, res) => {
    const { reason } = req.body;
    
    db.get('SELECT * FROM transactions WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'WAITING_PAYMENT') return res.status(400).json({ error: 'Transaksi berbayar harus direfund oleh admin' });

        db.run(
            `UPDATE transactions SET status = 'CANCELLED', cancel_reason = ?, cancelled_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [reason || 'Dibatalkan buyer', req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal cancel' });
                
                // Kembalikan stok reservasi
                db.run('UPDATE products SET stock = stock + 1 WHERE id = ?', [trx.product_id]);

                res.json({ message: 'Transaksi dibatalkan' });
            }
        );
    });
});

app.get('/api/transaction/:id', authenticateToken, (req, res) => {
    db.get(`SELECT t.*, p.title as product_name FROM transactions t LEFT JOIN products p ON t.product_id = p.id
            WHERE t.id = ? AND (t.buyer_id = ? OR t.seller_id = ? OR EXISTS
            (SELECT 1 FROM users u WHERE u.id = ? AND u.role IN ('ADMIN','SUPERADMIN')))`,
        [req.params.id, req.user.id, req.user.id, req.user.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            res.json(row);
        }
    );
});

// ==========================================
// 🛒 BUYER TRANSACTIONS API
// ==========================================

// Get buyer transactions (riwayat pembelian)
app.get('/api/buyer/transactions', authenticateToken, (req, res) => {
    const { status } = req.query;
    let query = `SELECT t.*, p.title as product_name, p.images as product_images,
                 u.name as seller_name, u.telegram as seller_telegram
                 FROM transactions t 
                 LEFT JOIN products p ON t.product_id = p.id 
                 LEFT JOIN users u ON t.seller_id = u.id
                 WHERE t.buyer_id = ?`;
    const params = [req.user.id];
    
    if (status) {
        query += ' AND t.status = ?';
        params.push(status);
    }
    query += ' ORDER BY t.created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil transaksi' });
        res.json({ transactions: rows || [] });
    });
});

// ==========================================
// 📊 SELLER DASHBOARD API
// ==========================================

// Get seller orders (pesanan masuk)
app.get('/api/seller/orders', authenticateToken, (req, res) => {
    const { status } = req.query;
    let query = `SELECT t.*, p.title as product_name, p.images as product_images,
                 u.name as buyer_name, u.telegram as buyer_telegram, u.whatsapp as buyer_whatsapp
                 FROM transactions t 
                 LEFT JOIN products p ON t.product_id = p.id 
                 LEFT JOIN users u ON t.buyer_id = u.id
                 WHERE t.seller_id = ?`;
    const params = [req.user.id];
    
    if (status) {
        query += ' AND t.status = ?';
        params.push(status);
    }
    query += ' ORDER BY t.created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil pesanan' });
        res.json({ orders: rows || [] });
    });
});

// Update order status (seller process)
app.put('/api/seller/orders/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['PROCESSING'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid (hanya PROCESSING)' });
    }
    
    db.get('SELECT * FROM transactions WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id], (err, trx) => {
        if (err || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (trx.status !== 'PAID') return res.status(400).json({ error: 'Pesanan belum dibayar' });
        
        db.run('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id], function(err2) {
            if (err2) {
                console.error('DB update error:', err2.message);
                return res.status(500).json({ error: 'Gagal update status: ' + err2.message });
            }
            res.json({ success: true, message: `Status diubah ke ${status}` });
        });
    });
});

// Seller stats
app.get('/api/seller/stats', authenticateToken, (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as count FROM transactions WHERE seller_id = ? AND status = "WAITING_PAYMENT"', [req.user.id], (err, row) => {
        stats.pending = row ? row.count : 0;
        db.get('SELECT COUNT(*) as count FROM transactions WHERE seller_id = ? AND status = "PROCESSING"', [req.user.id], (err2, row2) => {
            stats.processing = row2 ? row2.count : 0;
            db.get('SELECT COUNT(*) as count FROM transactions WHERE seller_id = ? AND status = "COMPLETED"', [req.user.id], (err3, row3) => {
                stats.completed = row3 ? row3.count : 0;
                db.get('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE seller_id = ? AND status = "COMPLETED"', [req.user.id], (err4, row4) => {
                    stats.total_earnings = row4 ? row4.total : 0;
                    db.get('SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND status = "ACTIVE"', [req.user.id], (err5, row5) => {
                        stats.active_products = row5 ? row5.count : 0;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// ==========================================
// 💬 CHAT API
// ==========================================

// Get chat messages for a transaction
app.get('/api/chat/:transactionId', authenticateToken, (req, res) => {
    // Verify user is part of this transaction OR member of its chat group (admin)
    db.get(`SELECT t.* FROM transactions t WHERE t.id = ? AND (t.buyer_id = ? OR t.seller_id = ? OR EXISTS
        (SELECT 1 FROM chat_groups cg JOIN chat_group_members gm ON gm.group_id=cg.id WHERE cg.transaction_id=t.id AND gm.user_id=?))`,
        [req.params.transactionId, req.user.id, req.user.id, req.user.id], (err, trx) => {
            if (err || !trx) return res.status(403).json({ error: 'Akses ditolak' });
            
            // Get group info
            db.get(`SELECT cg.*, 
                    (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count
                    FROM chat_groups cg WHERE cg.transaction_id = ?`, 
                [req.params.transactionId], (errGroup, group) => {
                
                db.all(`SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
                        FROM chat_messages cm 
                        LEFT JOIN users u ON cm.sender_id = u.id
                        WHERE cm.transaction_id = ? 
                        ORDER BY cm.created_at ASC`,
                    [req.params.transactionId],
                    (err2, rows) => {
                        if (err2) return res.status(500).json({ error: 'Gagal mengambil chat' });
                        
                        // Mark messages as read
                        db.run('UPDATE chat_messages SET read = 1 WHERE transaction_id = ? AND sender_id != ?', 
                            [req.params.transactionId, req.user.id]);
                        
                        // Get group members
                        db.all(`SELECT u.id, u.name, u.role as user_role, cgm.role as group_role
                                FROM chat_group_members cgm
                                LEFT JOIN users u ON cgm.user_id = u.id
                                WHERE cgm.group_id = ?`, [group?.id], (err3, members) => {
                            
                            res.json({ 
                                messages: rows || [], 
                                transaction: trx,
                                group: group || null,
                                members: members || []
                            });
                        });
                    }
                );
            });
        }
    );
});

// Send chat message (buyer, seller, atau admin)
app.post('/api/chat/:transactionId', authenticateToken, (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    
    // Verify user is part of this transaction OR member of its chat group (admin)
    db.get(`SELECT t.* FROM transactions t WHERE t.id = ? AND (t.buyer_id = ? OR t.seller_id = ? OR EXISTS
        (SELECT 1 FROM chat_groups cg JOIN chat_group_members gm ON gm.group_id=cg.id WHERE cg.transaction_id=t.id AND gm.user_id=?))`,
        [req.params.transactionId, req.user.id, req.user.id, req.user.id], (err, trx) => {
            if (err || !trx) return res.status(403).json({ error: 'Akses ditolak' });
            
            // Get group_id
            db.get('SELECT id FROM chat_groups WHERE transaction_id = ?', [req.params.transactionId], (errGrp, group) => {
            
                db.run('INSERT INTO chat_messages (transaction_id, group_id, sender_id, message) VALUES (?, ?, ?, ?)',
                    [req.params.transactionId, group?.id || null, req.user.id, message.trim()],
                    function(err2) {
                        if (err2) return res.status(500).json({ error: 'Gagal mengirim pesan' });
                        
                        // Notif Telegram ke admin
                        notifyNewChat(req.params.transactionId, req.user.name, message.trim())
                            .catch(e => console.error('Notif chat error:', e.message));
                        
                        res.json({ id: this.lastID });
                    }
                );
            });
        }
    );
});

// Get user's active chats (list of transactions with chat)
app.get('/api/chats', authenticateToken, (req, res) => {
    db.all(`SELECT t.id as transaction_id, t.status as trx_status, t.amount,
            p.title as product_name, p.images as product_images,
            CASE WHEN t.buyer_id = ? THEN seller.name ELSE buyer.name END as other_name,
            CASE WHEN t.buyer_id = ? THEN t.seller_id ELSE t.buyer_id END as other_id,
            (SELECT cm.message FROM chat_messages cm WHERE cm.transaction_id = t.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
            (SELECT cm.created_at FROM chat_messages cm WHERE cm.transaction_id = t.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_at,
            (SELECT COUNT(*) FROM chat_messages cm WHERE cm.transaction_id = t.id AND cm.sender_id != ? AND cm.read = 0) as unread_count
            FROM transactions t
            LEFT JOIN products p ON t.product_id = p.id
            LEFT JOIN users seller ON t.seller_id = seller.id
            LEFT JOIN users buyer ON t.buyer_id = buyer.id
            WHERE t.buyer_id = ? OR t.seller_id = ?
            ORDER BY last_message_at DESC`,
        [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Gagal mengambil chat list' });
            res.json({ chats: rows || [] });
        }
    );
});

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ==========================================
// ⏰ AUTO-CANCEL TRANSACTIONS (node-cron)
// ==========================================
// Setiap 10 menit, cek transaksi yang sudah > 1 jam belum bayar → auto cancel
cron.schedule('*/10 * * * *', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    db.all(
        `SELECT t.id, t.product_id FROM transactions t 
         WHERE t.status = 'WAITING_PAYMENT' AND t.created_at < ?`,
        [oneHourAgo],
        (err, rows) => {
            if (err || !rows || rows.length === 0) return;
            
            rows.forEach(trx => {
                db.run(
                    `UPDATE transactions SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP, cancel_reason = 'Auto-cancel: tidak bayar dalam 1 jam' WHERE id = ?`,
                    [trx.id],
                    (err2) => {
                        if (!err2) {
                            // Kembalikan stok produk
                            db.run('UPDATE products SET stock = stock + 1 WHERE id = ?', [trx.product_id]);
                            console.log(`⏰ Auto-cancelled transaction: ${trx.id}`);
                        }
                    }
                );
            });
        }
    );
});

console.log('⏰ Auto-cancel cron aktif (cek setiap 10 menit, batas 1 jam)');

// ==========================================
// 📋 GET ADMIN LIST (for checkout admin picker)
// ==========================================
app.get('/api/admins', authenticateToken, (req, res) => {
    db.all('SELECT id, name, email FROM users WHERE role IN ("SUPERADMIN","ADMIN") ORDER BY role, name', [], (err, admins) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil daftar admin' });
        res.json({ admins });
    });
});

// ==========================================
// 💸 RELEASE ESCROW — Admin cairkan dana ke seller
// ==========================================
app.post('/api/transaction/:id/release', authenticateToken, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
            return res.status(403).json({ error: 'Hanya admin yang bisa mencairkan dana' });
        }
        
        const trxId = req.params.id;
        db.get('SELECT * FROM transactions WHERE id = ?', [trxId], (err2, trx) => {
            if (err2 || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            
            if (trx.status !== 'COMPLETED') {
                return res.status(400).json({ error: 'Transaksi belum COMPLETED. Tidak bisa cairkan.' });
            }
            
            if (trx.escrow_released) {
                return res.status(400).json({ error: 'Dana sudah dicairkan sebelumnya' });
            }
            
            // Hitung fee dan seller amount
            db.get("SELECT value FROM settings WHERE key = 'rekber_fee_percent'", [], (err3, feeRow) => {
                const feePercent = feeRow ? parseFloat(feeRow.value) : 5;
                const platformFee = Math.round(trx.amount * feePercent / 100);
                const sellerAmount = trx.amount - platformFee;
                
                db.serialize(() => {
                    // Update transaksi
                    db.run(
                        'UPDATE transactions SET escrow_released = 1, platform_fee = ?, seller_amount = ? WHERE id = ?',
                        [platformFee, sellerAmount, trxId]
                    );
                    
                    // Tambah saldo seller
                    db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [sellerAmount, trx.seller_id]);
                    
                    // Kirim notif ke group
                    notifyGroupChat(trxId, `✅ Dana dicairkan ke seller. Rp ${sellerAmount.toLocaleString('id-ID')} (setelah fee ${feePercent}%)`, req.user.id);
                    
                    res.json({
                        message: 'Dana berhasil dicairkan ke seller',
                        seller_amount: sellerAmount,
                        platform_fee: platformFee,
                        fee_percent: feePercent
                    });
                });
            });
        });
    });
});

// ==========================================
// 💰 SELLER WITHDRAW — Tarik saldo
// ==========================================
app.post('/api/auth/withdraw', authenticateToken, (req, res) => {
    const { amount, method, account_number, account_name } = req.body;
    
    if (!amount || amount < 10000) {
        return res.status(400).json({ error: 'Minimal penarikan Rp 10.000' });
    }
    
    if (!method || !account_number || !account_name) {
        return res.status(400).json({ error: 'Metode, nomor rekening, dan nama pemilik wajib diisi' });
    }
    
    db.get('SELECT balance FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User tidak ditemukan' });
        
        if (user.balance < amount) {
            return res.status(400).json({ error: `Saldo tidak cukup. Saldo: Rp ${user.balance.toLocaleString('id-ID')}` });
        }
        
        db.serialize(() => {
            // Kurangi saldo
            db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, req.user.id]);
            
            // Simpan request withdraw
            db.run(
                `INSERT INTO withdraw_requests (user_id, amount, method, account_number, account_name, status)
                 VALUES (?, ?, ?, ?, ?, 'PENDING')`,
                [req.user.id, amount, method, account_number, account_name]
            );
            
            res.json({
                message: 'Request penarikan berhasil dikirim',
                amount,
                method,
                account_number
            });
        });
    });
});

// ==========================================
// 📋 ADMIN: GET WITHDRAW REQUESTS
// ==========================================
app.get('/api/admin/withdrawals', authenticateToken, (req, res) => {
    db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }
        
        db.all(
            `SELECT w.*, u.name as user_name, u.email as user_email
             FROM withdraw_requests w
             JOIN users u ON w.user_id = u.id
             ORDER BY w.created_at DESC
             LIMIT 50`,
            [],
            (err2, requests) => {
                if (err2) return res.status(500).json({ error: 'Gagal mengambil data' });
                res.json({ withdrawals: requests || [] });
            }
        );
    });
});

// ==========================================
// ✅ ADMIN: APPROVE/REJECT WITHDRAWAL
// ==========================================
app.put('/api/admin/withdrawals/:id', authenticateToken, (req, res) => {
    const { status } = req.body; // APPROVED or REJECTED
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid' });
    }
    
    db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }
        
        db.get('SELECT * FROM withdraw_requests WHERE id = ?', [req.params.id], (err2, wr) => {
            if (err2 || !wr) return res.status(404).json({ error: 'Request tidak ditemukan' });
            if (wr.status !== 'PENDING') return res.status(400).json({ error: 'Request sudah diproses' });
            
            if (status === 'REJECTED') {
                // Kembalikan saldo
                db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [wr.amount, wr.user_id]);
            }
            
            db.run('UPDATE withdraw_requests SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, req.params.id]);
            
            res.json({ message: `Penarikan ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}` });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 PusatGameIndonesia running on port ${PORT}`);
    console.log(`📦 Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Helper: get buyer/seller info
function getUserInfo(userId, callback) {
    db.get('SELECT id, name, telegram, whatsapp FROM users WHERE id = ?', [userId], callback);
}
