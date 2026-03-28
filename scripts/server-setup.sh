#!/bin/bash
# Honey Nest Dashboard — One-time VPS setup
# Run as root on a fresh Ubuntu 24.04 server:
#   curl -sSL https://raw.githubusercontent.com/YOURUSER/honey-nest-dashboard/master/scripts/server-setup.sh | bash -s YOUR_DOMAIN REPO_URL
#
# Or copy this file to the server and run:
#   bash server-setup.sh dash.yourdomain.com https://github.com/YOURUSER/honey-nest-dashboard.git

set -euo pipefail

DOMAIN="${1:?Usage: bash server-setup.sh DOMAIN REPO_URL}"
REPO_URL="${2:?Usage: bash server-setup.sh DOMAIN REPO_URL}"
APP_DIR="/opt/app"
BACKUP_DIR="/opt/backups"

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Cloning repo..."
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "==> Installing dependencies..."
npm install

echo "==> Building client..."
npm run build

echo "==> Starting app with PM2..."
npx cross-env NODE_ENV=production pm2 start "npx cross-env NODE_ENV=production tsx server/src/index.ts" --name honey-nest --cwd "$APP_DIR"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo "==> Installing Caddy..."
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudflare.com/caddyserver/pkgs/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudflare.com/caddyserver/pkgs/stable/debian/config.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

echo "==> Configuring Caddy for $DOMAIN..."
cat > /etc/caddy/Caddyfile << EOF
$DOMAIN {
    reverse_proxy localhost:3001
}
EOF
systemctl restart caddy

echo "==> Setting up daily database backup..."
mkdir -p "$BACKUP_DIR"
(crontab -l 2>/dev/null; echo "0 2 * * * cp $APP_DIR/data/honey-nest.db $BACKUP_DIR/honey-nest-\$(date +\%Y\%m\%d).db && find $BACKUP_DIR -name '*.db' -mtime +30 -delete") | crontab -

echo ""
echo "============================================"
echo "  Honey Nest is live!"
echo "  https://$DOMAIN"
echo ""
echo "  Database: $APP_DIR/data/honey-nest.db"
echo "  Backups:  $BACKUP_DIR/ (daily, 30-day retention)"
echo "  Logs:     pm2 logs honey-nest"
echo "============================================"
