# 🔒 SSL Checker - Domain Status Checker

Website sederhana untuk mengecek status SSL dan HTTP response dari daftar domain desa Indonesia.

## ✨ Fitur

- 📋 **Muat Daftar Domain**: Membaca file `list.txt` yang berisi daftar domain
- 🔍 **Cek SSL Status**: Melakukan pengecekan status SSL untuk semua domain
- 📊 **Tabel Informasi**: Menampilkan informasi dalam format tabel yang rapi
- 📈 **Statistik**: Menampilkan ringkasan hasil pengecekan
- 🎨 **UI Modern**: Desain responsif dan menarik dengan gradien warna
- 📱 **Mobile Friendly**: Responsif untuk berbagai ukuran layar

## 🚀 Cara Penggunaan

### 1. Buka Website
Buka file `index.html` di browser web Anda.

### 2. Muat Daftar Domain
- Klik tombol **"📋 Muat Daftar Domain"**
- Website akan membaca file `list.txt` dan menampilkan 270 domain dalam tabel

### 3. Cek Status SSL
- Setelah domain dimuat, tombol **"🔍 Cek Semua SSL"** akan aktif
- Klik tombol tersebut untuk memulai pengecekan
- Progress bar akan menampilkan kemajuan pengecekan

### 4. Lihat Hasil
- Tabel akan diupdate secara real-time dengan hasil pengecekan
- Statistik akan ditampilkan di bagian bawah
- Gunakan tombol **"🗑️ Bersihkan Hasil"** untuk mereset tabel

## 📊 Kolom Tabel

| Kolom | Deskripsi |
|-------|-----------|
| **No** | Nomor urut domain |
| **Nama Domain** | Nama domain yang dicek |
| **HTTP Response Code** | Kode response HTTP dari server |
| **SSL Status** | Status sertifikat SSL (Valid/No SSL/Error) |
| **SSL Issuer** | Nama penerbit sertifikat SSL |

## 🎯 Status Warna

- 🟢 **Hijau**: Status valid/berhasil
- 🔴 **Merah**: Status tidak valid/gagal
- 🟠 **Oranye**: Error atau masalah koneksi
- ⚪ **Abu-abu**: Status pending/menunggu

## 📁 Struktur File

```
ssl-checker/
├── index.html          # File HTML utama
├── styles.css          # File CSS untuk styling
├── script.js           # File JavaScript untuk logika
├── list.txt            # Daftar domain (270 domain)
└── README.md           # Dokumentasi ini
```

## ⚠️ Catatan Penting

- **Demo Mode**: Website ini menggunakan simulasi untuk pengecekan SSL (karena keterbatasan CORS)
- **File list.txt**: Pastikan file `list.txt` berada di folder yang sama dengan `index.html`
- **Browser Support**: Gunakan browser modern yang mendukung ES6+ dan Fetch API

## 🔧 Pengembangan Lanjutan

Untuk implementasi nyata, Anda bisa:
1. Menggunakan backend service untuk pengecekan SSL yang sebenarnya
2. Menambahkan fitur export hasil ke CSV/Excel
3. Menambahkan filter dan pencarian domain
4. Implementasi caching untuk hasil pengecekan

## 📞 Kontak

Jika ada pertanyaan atau saran, silakan hubungi developer.

---

**Dibuat dengan ❤️ untuk Indonesia**
# ssl-desa-checker
