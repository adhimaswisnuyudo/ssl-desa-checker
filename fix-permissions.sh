#!/bin/bash

echo "🔧 Fixing Permissions for Nginx Access"
echo "======================================"

# Get current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"

# Check if we're in the right place
if [[ ! -f "server.js" ]]; then
    echo "❌ Error: server.js not found. Please run this script from ssl-checker root directory."
    exit 1
fi

# Fix ownership (assuming nginx runs as www-data)
echo "👤 Fixing ownership..."
sudo chown -R www-data:www-data "$CURRENT_DIR"
echo "✅ Ownership fixed"

# Fix permissions
echo "🔐 Fixing permissions..."
sudo chmod -R 755 "$CURRENT_DIR"
sudo chmod -R 644 "$CURRENT_DIR"/*.js
sudo chmod -R 644 "$CURRENT_DIR"/*.json
sudo chmod -R 644 "$CURRENT_DIR"/*.md
sudo chmod -R 644 "$CURRENT_DIR"/*.conf
sudo chmod -R 644 "$CURRENT_DIR"/*.sh

# Make scripts executable
sudo chmod +x "$CURRENT_DIR"/*.sh
echo "✅ Permissions fixed"

# Fix public folder specifically
if [[ -d "public" ]]; then
    echo "📁 Fixing public folder permissions..."
    sudo chown -R www-data:www-data "$CURRENT_DIR/public"
    sudo chmod -R 755 "$CURRENT_DIR/public"
    sudo chmod -R 644 "$CURRENT_DIR/public"/*
    echo "✅ Public folder permissions fixed"
fi

# Check nginx user
NGINX_USER=$(ps aux | grep nginx | grep -v grep | head -1 | awk '{print $1}')
echo "🌐 Nginx running as user: $NGINX_USER"

# Show current permissions
echo ""
echo "📋 Current permissions:"
ls -la "$CURRENT_DIR"
echo ""
if [[ -d "public" ]]; then
    echo "📁 Public folder permissions:"
    ls -la "$CURRENT_DIR/public"
fi

echo ""
echo "🎉 Permission fix completed!"
echo "📝 Next steps:"
echo "1. Test nginx config: sudo nginx -t"
echo "2. Reload nginx: sudo systemctl reload nginx"
echo "3. Check access: https://csirt.bandungkab.go.id/ssl-desa-checker/"
