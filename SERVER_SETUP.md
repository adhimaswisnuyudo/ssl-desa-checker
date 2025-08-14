# 🚀 Server Setup Guide - BedaSSL Checker

**Panduan lengkap untuk deploy BedaSSL Checker di server**

## 📋 Prerequisites

- **OS**: Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- **RAM**: Minimum 512MB
- **Storage**: Minimum 1GB free space
- **User**: Root atau user dengan sudo privileges

## 🚀 Quick Installation

### 1. Clone Repository
```bash
cd /var/www/html/
git clone https://github.com/your-username/ssl-checker.git
cd ssl-checker
```

### 2. Run Auto Install Script
```bash
chmod +x install.sh
./install.sh
```

### 3. Start Application
```bash
./start.sh
```

## 🔧 Manual Installation

### Step 1: Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Step 2: Install OpenSSL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y openssl

# CentOS/RHEL
sudo yum install -y openssl
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Server
```bash
npm start
```

## 🌐 Web Server Configuration

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/ssl-checker/public
    
    <Directory /var/www/html/ssl-checker/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/ssl-checker/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔒 Security Configuration

### 1. Firewall Setup
```bash
# Allow HTTP, HTTPS, and Node.js port
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
sudo ufw enable
```

### 2. SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d your-domain.com
```

### 3. Environment Variables
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
EOF
```

## 📱 Access URLs

- **Frontend**: `http://your-server-ip/ssl-checker/public/`
- **Backend API**: `http://your-server-ip:3001`
- **Health Check**: `http://your-server-ip:3001/api/health`

## 🚨 Troubleshooting

### Port 3001 Already in Use
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>
```

### Permission Denied
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/html/ssl-checker
sudo chmod -R 755 /var/www/html/ssl-checker
```

### OpenSSL Not Found
```bash
# Check OpenSSL installation
which openssl
openssl version

# Reinstall if needed
sudo apt-get install --reinstall openssl
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install specific version if needed
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔄 Process Management

### Using PM2 (Recommended for Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "bedassl-checker"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Systemd Service
```bash
# Create service file
sudo tee /etc/systemd/system/bedassl-checker.service << EOF
[Unit]
Description=BedaSSL Checker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html/ssl-checker
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable bedassl-checker
sudo systemctl start bedassl-checker
```

## 📊 Monitoring

### Check Application Status
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Check logs
tail -f /var/log/bedassl-checker.log

# Check process
ps aux | grep node
```

### Performance Monitoring
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check network connections
netstat -tulpn | grep :3001
```

## 🔄 Updates

### Update Application
```bash
cd /var/www/html/ssl-checker
git pull origin main
npm install
pm2 restart bedassl-checker
# atau
sudo systemctl restart bedassl-checker
```

### Update Dependencies
```bash
npm update
npm audit fix
```

## 📞 Support

Jika mengalami masalah:
1. Check logs: `tail -f /var/log/bedassl-checker.log`
2. Check status: `pm2 status` atau `systemctl status bedassl-checker`
3. Check network: `curl http://localhost:3001/api/health`
4. Review this guide and troubleshooting section

---

**🎉 BedaSSL Checker siap digunakan di server production!**
