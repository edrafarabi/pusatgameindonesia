const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (!err) {
        db.run('PRAGMA journal_mode = WAL;');
    }
});
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET missing'); process.exit(1); }

// Auth middleware (optional - works with or without token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
            next();
        });
    } else {
        next();
    }
};

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Login diperlukan' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid' });
        req.user = user;
        next();
    });
};

const requireSeller = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Login diperlukan' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid' });
        if (!['SELLER', 'ADMIN', 'SUPERADMIN'].includes(user.role)) {
            return res.status(403).json({ error: 'Kamu harus menjadi seller untuk menjual produk' });
        }
        req.user = user;
        next();
    });
};

// ==========================================
// 📦 PRODUCTS / LISTINGS API
// ==========================================

// Get all products (public)
router.get('/', (req, res) => {
    const { category, game, search, sort, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE p.status = "ACTIVE"';
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.status = "ACTIVE"';
    const params = [];
    const countParams = [];

    if (category) {
        query += ' AND p.category = ?';
        countQuery += ' AND p.category = ?';
        params.push(category);
        countParams.push(category);
    }
    if (game) {
        query += ' AND p.game_name = ?';
        countQuery += ' AND p.game_name = ?';
        params.push(game);
        countParams.push(game);
    }
    if (search) {
        query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.game_name LIKE ?)';
        countQuery += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.game_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'popular') query += ' ORDER BY p.sold_count DESC';
    else query += ' ORDER BY p.created_at DESC';

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.get(countQuery, countParams, (err, countRow) => {
        db.all(query, params, (err2, rows) => {
            res.json({
                products: rows || [],
                total: countRow ? countRow.total : 0,
                page: parseInt(page),
                totalPages: Math.ceil((countRow ? countRow.total : 0) / limit)
            });
        });
    });
});

// Get single product (public)
router.get('/:id', (req, res) => {
    db.get(
        'SELECT p.*, u.name as seller_name, u.email as seller_email FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = ?',
        [req.params.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'Produk tidak ditemukan' });
            res.json(row);
        }
    );
});

// Create new listing (requires auth)
router.post('/', requireSeller, (req, res) => {
    const { title, description, category, game_name, price, stock, images, specs, delivery_format } = req.body;
    if (!title || !category || !price) {
        return res.status(400).json({ error: 'Title, kategori, dan harga wajib diisi' });
    }

    const productId = `PROD-${Date.now()}`;
    db.run(
        `INSERT INTO products (id, seller_id, title, description, category, game_name, price, stock, images, specs, status, delivery_format)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
        [productId, req.user.id, title, description || '', category, game_name || '', price, stock || 1, images || '', specs || '', delivery_format || ''],
        function(err) {
            if (err) return res.status(500).json({ error: 'Gagal membuat produk', detail: err.message });
            res.json({ success: true, id: productId, message: 'Produk berhasil dibuat!' });
        }
    );
});

// Update product (owner or admin)
router.put('/:id', requireAuth, (req, res) => {
    const { title, description, category, game_name, price, stock, status, images, specs } = req.body;
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err || !product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        if (product.seller_id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Bukan pemilik produk' });
        }

        db.run(
            `UPDATE products SET title=?, description=?, category=?, game_name=?, price=?, stock=?, status=?, images=?, specs=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [title || product.title, description || product.description, category || product.category,
             game_name || product.game_name, price || product.price, stock ?? product.stock,
             status || product.status, images || product.images, specs || product.specs, req.params.id],
            function(err2) {
                if (err2) return res.status(500).json({ error: 'Gagal update produk' });
                res.json({ success: true, message: 'Produk berhasil diupdate' });
            }
        );
    });
});

// Delete product (owner or admin)
router.delete('/:id', requireAuth, (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err || !product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        if (product.seller_id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Bukan pemilik produk' });
        }
        db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err2) {
            if (err2) return res.status(500).json({ error: 'Gagal menghapus produk' });
            res.json({ success: true, message: 'Produk berhasil dihapus' });
        });
    });
});

// Get categories with counts (public)
router.get('/meta/categories', (req, res) => {
    db.all(
        `SELECT category, COUNT(*) as count FROM products WHERE status = 'ACTIVE' GROUP BY category ORDER BY count DESC`,
        (err, rows) => {
            res.json(rows || []);
        }
    );
});

// Get featured/recommended products (public)
router.get('/meta/featured', (req, res) => {
    db.all(
        `SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id
         WHERE p.status = 'ACTIVE' ORDER BY p.sold_count DESC, p.rating DESC LIMIT 8`,
        (err, rows) => {
            res.json(rows || []);
        }
    );
});

// Get latest products (public)
router.get('/meta/latest', (req, res) => {
    db.all(
        `SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id
         WHERE p.status = 'ACTIVE' ORDER BY p.created_at DESC LIMIT 8`,
        (err, rows) => {
            res.json(rows || []);
        }
    );
});

module.exports = router;
