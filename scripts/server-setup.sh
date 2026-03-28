#!/bin/bash
# Honey Nest Dashboard — One-time VPS setup
# Run as root on a fresh Ubuntu 24.04 server:
#
# Without domain (IP only):
#   bash server-setup.sh https://github.com/USER/repo.git
#
# With domain (adds Caddy + HTTPS):
#   bash server-setup.sh https://github.com/USER/repo.git dash.yourdomain.com

set -euo pipefail

REPO_URL="${1:?Usage: bash server-setup.sh REPO_URL [DOMAIN]}"
DOMAIN="${2:-}"
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

if [ -n "$DOMAIN" ]; then
  # With domain: app on 3001, Caddy handles 80/443 + HTTPS
  APP_PORT=3001

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
  URL="https://$DOMAIN"
else
  # No domain: app serves directly on port 80
  APP_PORT=80
  URL="http://$(curl -s ifconfig.me)"
fi

echo "==> Starting app with PM2 on port $APP_PORT..."
PORT=$APP_PORT pm2 start "npx cross-env NODE_ENV=production PORT=$APP_PORT tsx server/src/index.ts" --name honey-nest --cwd "$APP_DIR"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo "==> Setting up daily database backup..."
mkdir -p "$BACKUP_DIR"
(crontab -l 2>/dev/null; echo "0 2 * * * cp $APP_DIR/data/honey-nest.db $BACKUP_DIR/honey-nest-\$(date +\%Y\%m\%d).db && find $BACKUP_DIR -name '*.db' -mtime +30 -delete") | crontab -

echo ""
echo "============================================"
echo "  Honey Nest is live!"
echo "  $URL"
echo ""
echo "  Database: $APP_DIR/data/honey-nest.db"
echo "  Backups:  $BACKUP_DIR/ (daily, 30-day retention)"
echo "  Logs:     pm2 logs honey-nest"
echo "============================================"
