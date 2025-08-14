#!/bin/bash

echo "🔍 Testing API Connectivity - BedaSSL Checker"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="csirt.bandungkab.go.id"
SUBDIR="ssl-desa-checker"

echo -e "${YELLOW}🌐 Testing domain: $DOMAIN${NC}"
echo -e "${YELLOW}📁 Subdirectory: $SUBDIR${NC}"

# Test 1: Frontend Access
echo ""
echo -e "${YELLOW}📱 Test 1: Frontend Access${NC}"
FRONTEND_URL="https://$DOMAIN/$SUBDIR/public/"
echo "Testing: $FRONTEND_URL"

if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend accessible (200 OK)${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

# Test 2: Health Check API
echo ""
echo -e "${YELLOW}🔌 Test 2: Health Check API${NC}"
HEALTH_URL="https://$DOMAIN/$SUBDIR/health"
echo "Testing: $HEALTH_URL"

HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$HEALTH_URL")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | tail -c4)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -c -4)

if [[ "$HEALTH_STATUS" == "200" ]]; then
    echo -e "${GREEN}✅ Health check successful (200 OK)${NC}"
    echo "Response: $HEALTH_BODY"
else
    echo -e "${RED}❌ Health check failed (Status: $HEALTH_STATUS)${NC}"
    echo "Response: $HEALTH_BODY"
fi

# Test 3: API Endpoint
echo ""
echo -e "${YELLOW}🔌 Test 3: API Endpoint${NC}"
API_URL="https://$DOMAIN/$SUBDIR/api/check-domain/google.com"
echo "Testing: $API_URL"

API_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL")
API_STATUS=$(echo "$API_RESPONSE" | tail -c4)
API_BODY=$(echo "$API_RESPONSE" | head -c -4)

if [[ "$API_STATUS" == "200" ]]; then
    echo -e "${GREEN}✅ API endpoint successful (200 OK)${NC}"
    echo "Response: $API_BODY"
elif [[ "$API_STATUS" == "404" ]]; then
    echo -e "${RED}❌ API endpoint not found (404)${NC}"
    echo "Response: $API_BODY"
else
    echo -e "${YELLOW}⚠️ API endpoint status: $API_STATUS${NC}"
    echo "Response: $API_BODY"
fi

# Test 4: Local Backend
echo ""
echo -e "${YELLOW}🔌 Test 4: Local Backend${NC}"
LOCAL_HEALTH="http://localhost:3001/api/health"
echo "Testing: $LOCAL_HEALTH"

if curl -s "$LOCAL_HEALTH" > /dev/null; then
    echo -e "${GREEN}✅ Local backend running on port 3001${NC}"
else
    echo -e "${RED}❌ Local backend not accessible on port 3001${NC}"
fi

# Test 5: Nginx Configuration
echo ""
echo -e "${YELLOW}⚙️ Test 5: Nginx Configuration${NC}"
if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors:${NC}"
    sudo nginx -t
fi

# Test 6: Nginx Status
echo ""
echo -e "${YELLOW}🌐 Test 6: Nginx Status${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Test 7: Port 3001 Check
echo ""
echo -e "${YELLOW}🔌 Test 7: Port 3001 Check${NC}"
if netstat -tulpn 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✅ Port 3001 is listening${NC}"
    netstat -tulpn | grep ":3001"
else
    echo -e "${RED}❌ Port 3001 is not listening${NC}"
fi

# Test 8: Process Check
echo ""
echo -e "${YELLOW}🔄 Test 8: Process Check${NC}"
if pgrep -f "node server.js" > /dev/null; then
    echo -e "${GREEN}✅ Node.js server process is running${NC}"
    ps aux | grep "node server.js" | grep -v grep
else
    echo -e "${RED}❌ Node.js server process is not running${NC}"
fi

# Recommendations
echo ""
echo -e "${YELLOW}💡 Recommendations:${NC}"

if [[ "$HEALTH_STATUS" != "200" ]] || [[ "$API_STATUS" == "404" ]]; then
    echo -e "${RED}🔧 Fix needed:${NC}"
    echo "1. Check if Node.js backend is running: npm start"
    echo "2. Update Nginx config with nginx-ssl-desa-checker-working.conf"
    echo "3. Test Nginx config: sudo nginx -t"
    echo "4. Reload Nginx: sudo systemctl reload nginx"
    echo "5. Check Nginx error logs: sudo tail -f /var/log/nginx/error.log"
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 API connectivity test completed!${NC}"
