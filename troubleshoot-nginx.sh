#!/bin/bash

echo "🔍 Nginx 403 Forbidden Troubleshooting"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current directory
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}📍 Current directory: $CURRENT_DIR${NC}"

# Check if we're in the right place
if [[ ! -f "server.js" ]]; then
    echo -e "${RED}❌ Error: server.js not found. Please run this script from ssl-checker root directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found server.js - we're in the right place${NC}"

# Check if public folder exists
if [[ ! -d "public" ]]; then
    echo -e "${RED}❌ Error: public folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found public folder${NC}"

# Check if index.html exists
if [[ ! -f "public/index.html" ]]; then
    echo -e "${RED}❌ Error: public/index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found public/index.html${NC}"

# Check current permissions
echo ""
echo -e "${YELLOW}📋 Current permissions:${NC}"
ls -la "$CURRENT_DIR"
echo ""
echo -e "${YELLOW}📁 Public folder permissions:${NC}"
ls -la "$CURRENT_DIR/public"

# Check nginx user
echo ""
echo -e "${YELLOW}🌐 Checking Nginx user...${NC}"
NGINX_USER=$(ps aux | grep nginx | grep -v grep | head -1 | awk '{print $1}')
if [[ -n "$NGINX_USER" ]]; then
    echo -e "${GREEN}✅ Nginx running as user: $NGINX_USER${NC}"
else
    echo -e "${RED}❌ Nginx not running${NC}"
fi

# Check if nginx can read the directory
echo ""
echo -e "${YELLOW}🔐 Testing Nginx access...${NC}"

# Test with nginx user (if possible)
if [[ "$NGINX_USER" == "www-data" ]]; then
    echo "Testing with www-data user..."
    sudo -u www-data test -r "$CURRENT_DIR/public/index.html"
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ www-data can read index.html${NC}"
    else
        echo -e "${RED}❌ www-data cannot read index.html${NC}"
    fi
fi

# Check SELinux status (if applicable)
if command -v sestatus &> /dev/null; then
    echo ""
    echo -e "${YELLOW}🛡️ Checking SELinux status...${NC}"
    sestatus
fi

# Check AppArmor status (if applicable)
if command -v aa-status &> /dev/null; then
    echo ""
    echo -e "${YELLOW}🛡️ Checking AppArmor status...${NC}"
    aa-status
fi

# Check nginx configuration
echo ""
echo -e "${YELLOW}⚙️ Checking Nginx configuration...${NC}"
if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors:${NC}"
    sudo nginx -t
fi

# Check nginx error logs
echo ""
echo -e "${YELLOW}📝 Checking Nginx error logs...${NC}"
if [[ -f "/var/log/nginx/error.log" ]]; then
    echo "Last 10 error log entries:"
    sudo tail -10 /var/log/nginx/error.log
else
    echo -e "${YELLOW}⚠️ Nginx error log not found${NC}"
fi

# Check nginx access logs
echo ""
echo -e "${YELLOW}📝 Checking Nginx access logs...${NC}"
if [[ -f "/var/log/nginx/access.log" ]]; then
    echo "Last 10 access log entries:"
    sudo tail -10 /var/log/nginx/access.log
else
    echo -e "${YELLOW}⚠️ Nginx access log not found${NC}"
fi

# Check if port 3001 is accessible
echo ""
echo -e "${YELLOW}🔌 Checking backend port 3001...${NC}"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 3001${NC}"
else
    echo -e "${RED}❌ Backend is not accessible on port 3001${NC}"
fi

# Check file ownership
echo ""
echo -e "${YELLOW}👤 Checking file ownership...${NC}"
OWNER=$(stat -c '%U' "$CURRENT_DIR/public")
GROUP=$(stat -c '%G' "$CURRENT_DIR/public")
echo "Public folder owner: $OWNER:$GROUP"

# Recommendations
echo ""
echo -e "${YELLOW}💡 Recommendations:${NC}"
echo "1. Run: chmod +x fix-permissions.sh && ./fix-permissions.sh"
echo "2. Update Nginx config with nginx-ssl-desa-checker-fixed.conf"
echo "3. Test config: sudo nginx -t"
echo "4. Reload Nginx: sudo systemctl reload nginx"
echo "5. Check access: https://csirt.bandungkab.go.id/ssl-desa-checker/"

echo ""
echo -e "${GREEN}🎉 Troubleshooting completed!${NC}"
