#!/usr/bin/env bash
# deploy-pgi.sh — deploy PusatGameIndonesia ke VPS
# Usage: ./deploy-pgi.sh [branch]  (default: master)

set -euo pipefail

BRANCH="${1:-master}"
REPO_DIR="/var/www/kasir"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
LOG_FILE="/tmp/pgi-deploy-$(date +%F_%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Deploy PusatGameIndonesia ($BRANCH) ==="
echo "Waktu: $(date)"

# 1. Pull latest
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 2. Backend deps (production only)
cd "$BACKEND_DIR"
echo "--- npm ci backend ---"
npm ci --omit=dev 2>&1 | tail -5

# 3. Frontend build
cd "$FRONTEND_DIR"
echo "--- npm ci frontend ---"
npm ci 2>&1 | tail -3
echo "--- npm run build ---"
npm run build 2>&1 | tail -5

# 4. Restart backend via PM2
echo "--- pm2 restart ---"
pm2 restart pusatgame-backend --update-env 2>&1 | tail -5
pm2 save

# 5. Health check
sleep 3
echo "--- health check ---"
curl -fsS -o /dev/null -w "Backend (127.0.0.1:3000): %{http_code}\n" http://127.0.0.1:3000/ || echo "Backend: GAGAL"
curl -fsS -o /dev/null -w "Frontend (HTTPS): %{http_code}\n" "https://$(grep -oP 'server_name \K[^;]+' /etc/nginx/sites-enabled/*.conf 2>/dev/null | head -1 || echo localhost)" || echo "Frontend: cek manual"

echo "=== Deploy selesai: $LOG_FILE ==="
