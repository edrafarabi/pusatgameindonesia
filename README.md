# PusatGameIndonesia

Marketplace produk digital game (akun, item, voucher) dengan sistem rekber (escrow) aman.
Fee 2.5% dibayar buyer (min Rp2.000), seller terima 100% harga.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (design-system.css)
- **Backend**: Express.js + SQLite3 (WAL mode) + JWT auth
- **Process**: PM2 (fork mode, port 3000)
- **Proxy**: Nginx → localhost:3000 (HTTPS Let's Encrypt)

## Arsitektur

```
Browser (React)  ──▶  Nginx (:443/:80)  ──▶  Express (:3000)  ──▶  SQLite (WAL)
```

## Folder Structure

```
/var/www/kasir/
├── backend/
│   ├── server.js            # Entry point, Express setup, DB init, semua route
│   ├── productRoutes.js     # /api/products (seller only)
│   ├── adminRoutes.js       # /api/admin/* (ADMIN/SUPERADMIN)
│   ├── telegramNotify.js    # Silent Telegram notifier (no log spam)
│   ├── database.sqlite      # Main DB (auto-migrate saat start)
│   ├── .env                 # JWT_SECRET, PORT
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx         # React root + BrowserRouter
│   │   ├── App.jsx          # Routes (Layout + AdminLayout)
│   │   ├── context/AuthContext.jsx  # JWT + localStorage session (7 hari)
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Header, search, bottom nav
│   │   │   └── AdminLayout.jsx  # Admin sidebar
│   │   └── pages/
│   │       ├── ProdukPage.jsx   # Market listing (home)
│   │       ├── ProductDetail.jsx
│   │       ├── SellAccount.jsx  # Form jual (seller only)
│   │       ├── Checkout.jsx     # Buyer create transaction
│   │       ├── ChatRoom.jsx     # Rekber chat + polling 5s
│   │       ├── ChatList.jsx
│   │       ├── RiwayatPage.jsx  # Buyer/Seller history
│   │       ├── SellerDashboard.jsx
│   │       ├── Akun.jsx         # Profile + upgrade seller
│   │       ├── Login.jsx / Register.jsx
│   │       └── admin/*          # Admin dashboard pages
│   ├── public/              # Static assets (logo, game images)
│   ├── design-system.css    # CSS variables + utilities (glass/light)
│   ├── index.css            # Tailwind + base styles
│   └── package.json
├── nginx/pusatgame.conf     # Contoh nginx reverse proxy + SSL
├── deploy-pgi.sh            # Script deploy otomatis
├── .env.example             # Template environment variable
└── .gitignore
```

## Database Schema (SQLite)

```sql
-- users
id INTEGER PK, name, email UNIQUE, password_hash, role (BUYER|SELLER|ADMIN|SUPERADMIN),
balance DEFAULT 0, total_earned, total_sales, telegram, created_at

-- products
id TEXT PK (PROD-...), seller_id FK, title, description, category (AKUN_GAME|ITEM_GAME|VOUCHER),
game_name, price INTEGER, stock INTEGER DEFAULT 1, images TEXT (CSV), specs, status (ACTIVE|SOLD_OUT),
rating, sold_count, delivery_format, created_at, updated_at

-- transactions
id TEXT PK (TRX-...), product_id FK, buyer_id FK, seller_id FK,
amount INTEGER, platform_fee INTEGER, total INTEGER, status,
payment_method, payment_proof, cancel_reason, delivery_note,
group_id FK (chat_group), created_at, paid_at, completed_at

-- chat_groups
id TEXT PK, transaction_id FK UNIQUE, created_at

-- chat_group_members
group_id FK, user_id FK, role (BUYER|SELLER|ADMIN), joined_at, PK(group_id,user_id)

-- chat_messages
id INTEGER PK, group_id FK, sender_id FK, message TEXT, message_type (text|system|delivery), created_at

-- settings
key TEXT PK, value TEXT
```

## Auth & Session Flow

1. **Login/Register** → `/api/auth/login|register` → returns `{ user, token }`
2. **Token** = JWT (HS256, `JWT_SECRET` dari `.env`, **no hardcoded fallback**), expiry 7 hari
3. **Client** simpan di `localStorage['pgi_session']` = `{ user, token, expiresAt }`
4. **AuthContext** (boot):
   - Baca cache → set user/token instant (no flash)
   - Background `GET /api/auth/me` → validasi token, update cache
   - Kalau 401/expired → silent logout, hapus cache
5. **Setiap request** pakai header `Authorization: Bearer <token>` via `api()` helper
6. **Logout** → hapus cache + redirect `/login`

**Role hierarchy**: `SUPERADMIN > ADMIN > SELLER > BUYER`
- Default registrasi = `BUYER`
- Upgrade seller → `POST /api/auth/upgrade-seller` (wajib field `telegram`)

## Money Flow (Rekber) — Critical

| Step | Actor | Endpoint | State Change |
|------|-------|----------|--------------|
| 1 | Buyer | `POST /api/transaction/create` | Stok -1 (reserve), trx `WAITING_PAYMENT` |
| 2 | Buyer | `PUT /api/transaction/:id/pay` | Upload bukti, trx `PAID` |
| 3 | Seller | `PUT /api/seller/orders/:id/deliver` | Kirim akun (delivery_note), trx `DELIVERED` |
| 4 | Buyer | `PUT /api/transaction/:id/confirm` | **Seller saldo +100% harga**, trx `COMPLETED`, produk delete kalau stok 0 |
| 5 | Buyer | `PUT /api/transaction/:id/dispute` | Trx `DISPUTED`, admin intervensi |
| 6 | Admin | `PUT /api/admin/transactions/:id/refund` | Refund buyer, stok +1, trx `CANCELLED` |

**Fee**: 2.5% dari harga, **minimum Rp2.000**, **dibayar buyer**. Seller terima 100% harga.

**Proteksi**:
- Double confirm diblokir (400)
- Cancel setelah bayar diblokir (400) — mesti refund via admin
- Stok decrement pakai `WHERE stock > 0` (race-safe)
- Transaksi wajib auth + ownership check

## Chat System (Polling, No Socket.IO)

- **Endpoint**: `GET /api/chat/:transactionId/messages?since=<ts>` (return new messages only)
- **Client**: `setInterval(loadChat, 5000)` di `ChatRoom.jsx`
- **Akses**: Buyer/Seller/Admin yang member `chat_group_members`
- **Kirim**: `POST /api/chat/:transactionId` (text, delivery_note)

## Key Backend Routes

| Route | Method | Auth | Role | Deskripsi |
|-------|--------|------|------|-----------|
| `/api/auth/login` | POST | - | - | Login → JWT |
| `/api/auth/register` | POST | - | - | Register BUYER |
| `/api/auth/upgrade-seller` | POST | ✓ | BUYER | Upgrade SELLER (telegram wajib) |
| `/api/auth/me` | GET | ✓ | - | Validasi token |
| `/api/products` | GET | - | - | List produk (filter, search, pagination) |
| `/api/products` | POST | ✓ | SELLER+ | Create listing |
| `/api/products/:id` | PUT/DELETE | ✓ | Owner/ADMIN | Update/hapus listing |
| `/api/transaction/create` | POST | ✓ | BUYER | Checkout → reserve stok |
| `/api/transaction/:id/pay` | PUT | ✓ | BUYER | Upload bukti bayar |
| `/api/seller/orders/:id/deliver` | PUT | ✓ | SELLER | Kirim akun |
| `/api/transaction/:id/confirm` | PUT | ✓ | BUYER | Terima → seller paid |
| `/api/transaction/:id/dispute` | PUT | ✓ | BUYER | Ajukan dispute |
| `/api/transaction/:id/cancel` | PUT | ✓ | BUYER | Cancel (hanya WAITING_PAYMENT) |
| `/api/buyer/transactions` | GET | ✓ | BUYER | Riwayat beli |
| `/api/seller/transactions` | GET | ✓ | SELLER | Riwayat jual |
| `/api/admin/*` | * | ✓ | ADMIN/SUPER | User, trx, listing, settings |

## Frontend Routing (App.jsx)

```
/ → ProdukPage (Market)
/produk → ProdukPage
/produk?search=... → ProdukPage (filtered)
/product/:id → ProductDetail
/jual → SellAccount (seller only, redirect /akun kalau belum)
/checkout/:id → Checkout (buyer)
/rekber/:id → ChatRoom (legacy alias)
/chats → ChatList
/riwayat → RiwayatPage
/akun → Akun (profile, upgrade seller, balance)
/seller → SellerDashboard
/admin/* → AdminLayout + pages
/login, /register → Auth pages
```

## CSS / Design System

- **File**: `frontend/src/design-system.css` (CSS variables + utilities)
- **Tema**: Light, marketplace style (putih/abu, biru accent)
- **Glassmorphism**: `.glass`, `.glass-strong`, `.glass-subtle`
- **Typography**: Inter (Google Fonts)
- **Warna**: `--color-bg:#f5f7fa`, `--color-text:#0f172a`, `--color-primary:#2563eb`, `--color-border:#e2e8f0`
- **No dark mode**, no emoji (pakai Lucide icons)

## Environment Variables (backend/.env)

```env
PORT=3000
JWT_SECRET=<wajib, random hex, no fallback>
NODE_ENV=production
# Optional (Telegram admin notify):
TELEGRAM_BOT_TOKEN=<bot token valid>
ADMIN_TELEGRAM_CHAT_ID=<chat id admin>
```

## Local Development

```bash
# Backend
cd backend && npm install && node server.js

# Frontend (di terminal lain)
cd frontend && npm install && npm run dev
```

Frontend dev jalan di :5173, proxy ke backend :3000 via Vite config.

## Deploy (Fresh VPS)

Lihat `deploy-pgi.sh`. Ringkas:

1. Node 20+, PM2, Nginx, Certbot
2. `git clone <repo> /var/www/kasir`
3. Backend: `cd backend && npm ci --omit=dev`
4. Frontend: `cd frontend && npm ci && npm run build`
5. Copy `.env.example` → `.env`, isi `JWT_SECRET` (openssl rand -hex 32)
6. PM2: `pm2 start backend/server.js --name pusatgame-backend`
7. Nginx: copy `nginx/pusatgame.conf`, sesuaikan domain, `certbot --nginx -d <domain>`
8. `pm2 save && pm2 startup`

## Backup & Maintenance

```bash
# Logs
pm2 logs pusatgame-backend --lines 100

# DB inspect
sqlite3 /var/www/kasir/backend/database.sqlite ".schema"

# Backup DB
cp /var/www/kasir/backend/database.sqlite /root/backup/pgi-$(date +%F).sqlite

# Restart
pm2 restart pusatgame-backend

# Rebuild frontend + restart
cd /var/www/kasir/frontend && npm run build && pm2 reload pusatgame-backend
```

## Known Limitations / Todo

- [ ] Telegram bot token valid → notif admin jalan
- [ ] Unit/integration test (belum ada)
- [ ] Rate-limit per IP (hanya global 100/15menit)
- [ ] Image upload ke Supabase/S3 (sekarang local `public/`)
- [ ] Admin settings UI untuk fee, payment methods
- [ ] Export transaksi CSV
- [ ] Pagination infinite scroll di ProdukPage

## Security Notes

- JWT secret **hanya di .env**, tidak di source
- Password bcrypt (cost 10)
- SQLite parameterized queries everywhere (no SQL injection)
- Auth middleware di setiap endpoint sensitif
- Ownership check di update/delete produk & transaksi
- CORS whitelist domain production only
- Helmet.js default headers
