#!/bin/bash
# Honey Nest Dashboard — Deploy updates
# Run on the VPS: bash /opt/app/scripts/deploy.sh

set -euo pipefail

APP_DIR="/opt/app"
cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull

echo "==> Installing dependencies..."
npm install

echo "==> Building client..."
npm run build

echo "==> Restarting app..."
pm2 restart honey-nest

echo "==> Done. App is live."
pm2 status honey-nest
