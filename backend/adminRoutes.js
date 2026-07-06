const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || 'edra_pusatgame_super_secret_key_12345';

// Middleware: Admin Only
const adminOnly = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token diperlukan' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid' });
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Akses ditolak. Hanya admin.' });
        }
        req.user = user;
        next();
    });
};

// ==========================================
// 📊 DASHBOARD STATS
// ==========================================
router.get('/dashboard', adminOnly, (req, res) => {
    const stats = {};

    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        stats.totalUsers = row ? row.count : 0;
        db.get('SELECT COUNT(*) as count FROM products WHERE status = "ACTIVE"', (err2, row2) => {
            stats.totalListings = row2 ? row2.count : 0;
            db.get('SELECT COUNT(*) as count FROM transactions', (err3, row3) => {
                stats.totalTransactions = row3 ? row3.count : 0;
                db.get('SELECT COUNT(*) as count FROM transactions WHERE status = "COMPLETED"', (err4, row4) => {
                    stats.completedTransactions = row4 ? row4.count : 0;
                    db.get('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = "COMPLETED"', (err5, row5) => {
                        stats.totalRevenue = row5 ? row5.total : 0;
                        db.get('SELECT COUNT(*) as count FROM transactions WHERE status = "WAITING_PAYMENT"', (err6, row6) => {
                            stats.pendingTransactions = row6 ? row6.count : 0;
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

// ==========================================
// 👥 USER MANAGEMENT
// ==========================================
router.get('/users', adminOnly, (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, email, role, phone, created_at FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        countQuery += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
        query += ' AND role = ?';
        countQuery += ' AND role = ?';
        params.push(role);
        countParams.push(role);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.get(countQuery, countParams, (err, countRow) => {
        db.all(query, params, (err2, rows) => {
            res.json({
                users: rows || [],
                total: countRow ? countRow.total : 0,
                page: parseInt(page),
                totalPages: Math.ceil((countRow ? countRow.total : 0) / limit)
            });
        });
    });
});

router.put('/users/:id', adminOnly, (req, res) => {
    const { name, email, role, password } = req.body;
    if (name && email) {
        let query = 'UPDATE users SET name = ?, email = ?, role = ?';
        let params = [name, email, role || 'BUYER'];
        if (password) {
            query += ', password = ?';
            params.push(password);
        }
        query += ' WHERE id = ?';
        params.push(req.params.id);

        db.run(query, params, function(err) {
            if (err) return res.status(400).json({ error: 'Gagal update user' });
            res.json({ success: true, message: 'User berhasil diupdate' });
        });
    } else {
        res.status(400).json({ error: 'Name dan email wajib diisi' });
    }
});

router.delete('/users/:id', adminOnly, (req, res) => {
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    }
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: 'Gagal menghapus user' });
        res.json({ success: true, message: 'User berhasil dihapus' });
    });
});

// ==========================================
// 💳 TRANSACTION MANAGEMENT
// ==========================================
router.get('/transactions', adminOnly, (req, res) => {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT t.*, p.title as product_name FROM transactions t LEFT JOIN products p ON t.product_id = p.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
        query += ' AND t.status = ?';
        countQuery += ' AND t.status = ?';
        params.push(status);
        countParams.push(status);
    }
    if (search) {
        query += ' AND (t.id LIKE ? OR p.title LIKE ?)';
        countQuery += ' AND (t.id LIKE ? OR p.title LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.get(countQuery, countParams, (err, countRow) => {
        db.all(query, params, (err2, rows) => {
            res.json({
                transactions: rows || [],
                total: countRow ? countRow.total : 0,
                page: parseInt(page),
                totalPages: Math.ceil((countRow ? countRow.total : 0) / limit)
            });
        });
    });
});

router.put('/transactions/:id/status', adminOnly, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['WAITING_PAYMENT', 'PAID', 'DELIVERED', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid' });
    }
    db.run('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: 'Gagal update status' });
        res.json({ success: true, message: `Status transaksi diubah ke ${status}` });
    });
});

// ==========================================
// ⚙️ WEBSITE SETTINGS
// ==========================================
router.get('/settings', adminOnly, (req, res) => {
    db.all('SELECT * FROM settings', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil settings' });
        const settings = {};
        (rows || []).forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    });
});

router.put('/settings', adminOnly, (req, res) => {
    const updates = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    Object.entries(updates).forEach(([key, value]) => { stmt.run(key, value); });
    stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'Gagal menyimpan settings' });
        res.json({ success: true, message: 'Settings berhasil disimpan' });
    });
});

// ==========================================
// 📦 LISTINGS MANAGEMENT
// ==========================================
router.get('/listings', adminOnly, (req, res) => {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT p.*, u.name as seller_name, u.email as seller_email FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
        query += ' AND p.status = ?';
        countQuery += ' AND p.status = ?';
        params.push(status);
        countParams.push(status);
    }
    if (category) {
        query += ' AND p.category = ?';
        countQuery += ' AND p.category = ?';
        params.push(category);
        countParams.push(category);
    }
    if (search) {
        query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
        countQuery += ' AND (p.title LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.get(countQuery, countParams, (err, countRow) => {
        db.all(query, params, (err2, rows) => {
            res.json({
                listings: rows || [],
                total: countRow ? countRow.total : 0,
                page: parseInt(page),
                totalPages: Math.ceil((countRow ? countRow.total : 0) / limit)
            });
        });
    });
});

router.put('/listings/:id/status', adminOnly, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'PENDING', 'REJECTED', 'SOLD'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid' });
    }
    db.run('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Gagal update status' });
        res.json({ success: true, message: `Status listing diubah ke ${status}` });
    });
});

router.delete('/listings/:id', adminOnly, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Gagal menghapus listing' });
        res.json({ success: true, message: 'Listing berhasil dihapus' });
    });
});

module.exports = router;
