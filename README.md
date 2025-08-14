# 🚀 BedaSSL Checker

**Real-time SSL Certificate Checker dengan Node.js Backend + OpenSSL**

## ✨ Fitur Utama

- **🔍 Real SSL Checking** - Menggunakan Node.js backend + OpenSSL untuk SSL certificate validation
- **📊 SSL Certificate Details** - Issuer, Organization, Issued Date, Expiry Date
- **🔎 Search & Filter** - Pencarian domain berdasarkan status atau issuer
- **📱 Responsive Design** - Works on desktop dan mobile
- **⚡ Lazy Loading** - Smooth loading animation dengan shimmer effect
- **🔄 Progress Tracking** - Progress bar untuk batch SSL checking
- **📋 270 Domains** - Load otomatis dari file list.txt

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ←→ Backend (Node.js/Express + OpenSSL) ←→ Internet
```

- **Frontend**: Pure HTML/CSS/JavaScript dengan lazy loading
- **Backend**: Node.js + Express + OpenSSL integration
- **Real-time**: SSL certificate validation langsung dari internet dengan OpenSSL

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm start
# atau
node server.js
```

### 3. Open Frontend
Buka `public/index.html` di browser atau serve dengan live server

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Full Domain Check (Recommended)
```
GET /api/check-domain/:domain
```

**Returns**: Complete SSL certificate details including issuer, organization, dates

## 🔧 Configuration

### Port
Default port: `3001`
Ubah dengan environment variable:
```bash
PORT=8080 node server.js
```

### Timeout Settings
- **SSL Check**: 10 seconds
- **HTTP Check**: 5 seconds
- **DNS Resolution**: Built-in timeout

## 📊 Data yang Dicheck

### SSL Certificate (OpenSSL)
- ✅ **Valid/Invalid Status**
- 🏢 **Issuer Organization** (extracted from O= field)
- 📅 **Issued Date**
- ⏰ **Expiry Date**
- 🔒 **Certificate Details** (via OpenSSL)

### Domain Processing
- 📋 **270 Domains** - Loaded automatically from list.txt
- 🔄 **Batch Processing** - Check all domains with progress tracking
- ⚡ **Individual Testing** - Test single domain per row
- 🎯 **Real-time Results** - Live SSL certificate validation

## 🎯 Contoh Output

```json
{
  "domain": "google.com",
  "ssl": {
    "hasSSL": true,
    "status": "Valid",
    "issuer": "CN=WE1,O=Google Trust Services,C=US",
    "organization": "Google Trust Services",
    "issuedOn": "2025-01-15",
    "expiresOn": "2025-04-15"
  }
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenSSL Integration** - Real SSL certificate parsing
- **Built-in SSL** - crypto, tls, https modules (fallback)

### Frontend
- **Vanilla JavaScript** - ES6+ features
- **Lazy Loading** - Smooth loading animations
- **Progress Tracking** - Real-time progress updates
- **Responsive CSS** - Mobile-first design

## 📁 Project Structure

```
ssl-checker/
├── server.js              # Backend server with OpenSSL
├── package.json           # Dependencies
├── list.txt               # 270 domain list
├── public/                # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Styling with loading animations
│   └── script-backend.js # Frontend logic with lazy loading
└── README.md             # Documentation
```

## 🔒 Security Features

- **CORS Enabled** - Cross-origin requests allowed
- **Input Validation** - Domain name sanitization
- **Timeout Protection** - Prevents hanging connections
- **Error Handling** - Graceful error responses
- **OpenSSL Integration** - Industry-standard SSL certificate validation

## 🚨 Troubleshooting

### Backend tidak start
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### SSL Check failed
- Pastikan domain valid dan accessible
- Check firewall settings
- Verify internet connection

### Frontend tidak connect ke backend
- Pastikan backend running di port 3001
- Check browser console untuk CORS errors
- Verify localhost accessibility

## 📈 Performance

- **Sequential Processing**: Check domains one by one with 500ms delay
- **Lazy Loading**: Smooth loading animations for better UX
- **Progress Tracking**: Real-time progress updates
- **Memory Management**: Automatic garbage collection
- **Response Caching**: No caching (real-time data)

## 🔄 Development

### Development Mode
```bash
npm run dev  # Requires nodemon
```

### Production
```bash
npm start
```

### Environment Variables
```bash
PORT=3001
NODE_ENV=production
```

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Untuk pertanyaan atau masalah:
- Check troubleshooting section
- Review console logs
- Verify network connectivity
- Test with simple domains first

## 🆕 Recent Updates

- **🎯 Simplified UI** - Removed charts and PDF export for cleaner interface
- **⚡ Lazy Loading** - Added smooth loading animations with shimmer effects
- **🔄 Progress Tracking** - Real-time progress bar for batch operations
- **📋 Auto Domain Loading** - 270 domains loaded automatically from list.txt
- **🏢 Organization Extraction** - Automatic extraction of Organization (O) from SSL issuer
- **🎨 Modern Design** - Clean, professional interface with blue color scheme

---

**🎉 BedaSSL Checker siap digunakan dengan data REAL dari internet menggunakan OpenSSL!**
