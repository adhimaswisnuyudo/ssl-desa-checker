#!/bin/bash

echo "🚀 BedaSSL Checker - Installation Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js..."
    
    # Install Node.js (Ubuntu/Debian)
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    # Install Node.js (CentOS/RHEL)
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ Unsupported package manager. Please install Node.js manually."
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm manually."
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if OpenSSL is available
if command -v openssl &> /dev/null; then
    OPENSSL_VERSION=$(openssl version)
    echo "✅ OpenSSL available: $OPENSSL_VERSION"
else
    echo "⚠️  OpenSSL not found. Installing OpenSSL..."
    
    # Install OpenSSL (Ubuntu/Debian)
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y openssl
    # Install OpenSSL (CentOS/RHEL)
    elif command -v yum &> /dev/null; then
        sudo yum install -y openssl
    else
        echo "⚠️  Please install OpenSSL manually for full SSL certificate details"
    fi
fi

# Create start script
echo "📝 Creating start script..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting BedaSSL Checker..."
echo "📱 Frontend: http://your-server-ip/ssl-checker/public/"
echo "🔧 Backend: http://your-server-ip:3001"
echo "⏹️  Press Ctrl+C to stop"

# Start the server
npm start
EOF

chmod +x start.sh

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update server IP in start.sh"
echo "2. Run: ./start.sh"
echo "3. Open: http://your-server-ip/ssl-checker/public/"
echo ""
echo "🔧 For development: npm run dev"
echo "📱 For production: npm start"
