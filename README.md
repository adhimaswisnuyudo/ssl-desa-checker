# 🚀 SSL Checker - DesaBandungKAB

**Real-time SSL Certificate Checker dengan Node.js Backend**

## ✨ Fitur Utama

- **🔍 Real SSL Checking** - Menggunakan Node.js backend untuk SSL certificate validation
- **🌐 HTTP/HTTPS Status** - Cek ketersediaan dan response code domain
- **📊 SSL Certificate Details** - Issuer, Organization, Issued Date, Expiry Date
- **📈 Interactive Charts** - Pie chart dan bar chart untuk visualisasi data
- **🔎 Search & Filter** - Pencarian domain berdasarkan status atau issuer
- **📄 PDF Export** - Generate laporan dalam format PDF
- **📱 Responsive Design** - Works on desktop dan mobile

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ←→ Backend (Node.js/Express) ←→ Internet
```

- **Frontend**: Pure HTML/CSS/JavaScript dengan Chart.js
- **Backend**: Node.js + Express + built-in SSL libraries
- **Real-time**: SSL certificate validation langsung dari internet

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

### SSL Check
```
GET /api/check-ssl/:domain
```

### HTTP Check
```
GET /api/check-http/:domain
```

### Full Domain Check
```
GET /api/check-domain/:domain
```

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

### SSL Certificate
- ✅ **Valid/Invalid Status**
- 🏢 **Issuer Organization**
- 📅 **Issued Date**
- ⏰ **Expiry Date**
- 🔒 **Security Headers**

### HTTP Status
- 🌐 **Response Code** (200, 301, 404, 500)
- ⚡ **Connection Status**
- 🕐 **Response Time**
- 🖥️ **Server Type**

### Domain Info
- 🌍 **IP Address**
- 🔍 **DNS Resolution**
- ⚠️ **Error Details**

## 🎯 Contoh Output

```json
{
  "domain": "google.com",
  "ssl": {
    "hasSSL": true,
    "status": "HTTPS OK (301)",
    "issuer": "WR2",
    "organization": "*.google.com",
    "issuedOn": "7/7/2025",
    "expiresOn": "29/9/2025",
    "validDays": 47
  },
  "http": {
    "status": "HTTP Connection Timeout",
    "ipAddress": "142.250.72.174"
  }
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Built-in SSL** - crypto, tls, https modules
- **DNS Resolution** - dns module

### Frontend
- **Vanilla JavaScript** - ES6+ features
- **Chart.js** - Interactive charts
- **jsPDF** - PDF generation
- **Responsive CSS** - Mobile-first design

## 📁 Project Structure

```
ssl-checker/
├── server.js              # Backend server
├── package.json           # Dependencies
├── public/                # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Styling
│   └── script-backend.js # Frontend logic
└── README.md             # Documentation
```

## 🔒 Security Features

- **CORS Enabled** - Cross-origin requests allowed
- **Input Validation** - Domain name sanitization
- **Timeout Protection** - Prevents hanging connections
- **Error Handling** - Graceful error responses

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

- **Concurrent Checks**: Sequential dengan delay 500ms
- **Connection Pooling**: Built-in Node.js optimization
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

---

**🎉 SSL Checker siap digunakan dengan data REAL dari internet!**
