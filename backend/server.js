const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const adminRoutes = require('./adminRoutes');
const productRoutes = require('./productRoutes');

const app = express();
const server = http.createServer(app);

// CORS - RESTRICTED (jangan origin '*')
const allowedOrigins = [
  'http://localhost:3000',
  'http://kasirindisiniaja.my.id',
  'https://kasirindisiniaja.my.id',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// JWT_SECRET WAJIB ADA (tidak boleh fallback)
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET tidak ditemukan di .env');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Rate Limiting (anti-DOS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 request per IP per 15 menit
  message: { error: 'Terlalu banyak request, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Database connected');
});

db.serialize(() => {
    // Users Table (password akan di-hash)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'BUYER',
        phone TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Transactions Table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        type TEXT NOT NULL,
        buyer_id INTEGER,
        seller_id INTEGER,
        amount INTEGER,
        status TEXT DEFAULT 'WAITING_PAYMENT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    )`);

    // Products Table
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

    // Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed SUPERADMIN (password akan di-hash di bawah)
    db.get('SELECT * FROM users WHERE email = ?', ['akunbaruedra@gmail.com'], (err, row) => {
        if (!row) {
            // Default password: edra123 (akan di-hash)
            const defaultPass = 'edra123';
            bcrypt.hash(defaultPass, 10, (hashErr, hash) => {
                if (!hashErr) {
                    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        ['Edra Wira', 'akunbaruedra@gmail.com', hash, 'SUPERADMIN']);
                    console.log('✅ SUPERADMIN created (password: edra123)');
                }
            });
        } else {
            db.run('UPDATE users SET role = "SUPERADMIN" WHERE email = ?', ['akunbaruedra@gmail.com']);
        }
    });

    // Seed default settings
    const defaultSettings = [
        ['site_name', 'PusatGameIndonesia'],
        ['site_description', 'Marketplace Jual Beli Akun & Item Game Indonesia'],
        ['contact_email', 'akunbaruedra@gmail.com'],
        ['rekber_fee_percent', '5'],
        ['payment_methods', 'DANA,GoPay,OVO,Transfer Bank,QRIS'],
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    defaultSettings.forEach(([key, value]) => stmt.run(key, value));
    stmt.finalize();
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

// Middleware Autentikasi JWT
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

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================

// Register (hash password)
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Lengkapi semua field' });
    }
    bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) return res.status(500).json({ error: 'Gagal hash password' });
        db.run('INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hash, phone || '', 'BUYER'],
            function(err) {
                if (err) return res.status(400).json({ error: 'Email sudah terdaftar' });
                res.json({ success: true, message: 'Pendaftaran berhasil! Silakan login.' });
            }
        );
    });
});

// Login (compare hash)
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
                success: true,
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        });
    });
});

// Get user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err || !user) return res.status(404).json({ error: 'User tidak ditemukan' });
            res.json(user);
        }
    );
});

// ==========================================
// 🛡️ REKBER TRANSACTION ENDPOINTS
// ==========================================

app.post('/api/transaction/create', authenticateToken, (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Produk diperlukan' });

    db.get('SELECT * FROM products WHERE id = ? AND status = "ACTIVE"', [product_id], (err, product) => {
        if (err || !product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

        const transactionId = `TRX-${Date.now()}`;
        db.run(
            'INSERT INTO transactions (id, product_id, type, buyer_id, seller_id, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transactionId, product_id, 'REKBER', req.user.id, product.seller_id, product.price, 'WAITING_PAYMENT'],
            function(err) {
                if (err) return res.status(500).json({ error: 'Gagal membuat transaksi' });
                res.json({ success: true, id: transactionId, message: 'Transaksi berhasil dibuat' });
            }
        );
    });
});

app.get('/api/transaction/:id', (req, res) => {
    db.get('SELECT t.*, p.title as product_name FROM transactions t LEFT JOIN products p ON t.product_id = p.id WHERE t.id = ?',
        [req.params.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            res.json(row);
        }
    );
});

// ==========================================
// 📦 ROUTES
// ==========================================
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// SPA ROUTING
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ==========================================
// 💬 REAL-TIME CHAT
// ==========================================
io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => socket.join(roomId));
    socket.on('send-message', (data) => {
        io.to(data.roomId).emit('receive-message', {
            sender: data.sender,
            message: data.message,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 PusatGameIndonesia running on port ${PORT}`);
    console.log(`📦 Allowed origins: ${allowedOrigins.join(', ')}`);
});
