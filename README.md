# Turnitin Storage Server (Backend)

Server penyimpanan statis berbasis **Express** dan **Multer** yang didedikasikan untuk mengelola berkas unggahan struk pembayaran, draf naskah pengajuan user, dan laporan hasil akhir pengecekan Turnitin.

---

## ⚙️ Fitur Utama

- **Unggah Berkas Tunggal**:
  - `POST /api/upload/:type`
  - Menyimpan berkas secara lokal berdasarkan tipe penyimpanan (`payments`, `documents`, `results`).
  - Menyediakan validasi ukuran berkas (maksimal 10MB) dan ekstensi dokumen.
  - Mengembalikan URL akses statis lokal.
- **Hapus Berkas**:
  - `DELETE /api/delete`
  - Menghapus berkas fisik yang disimpan di disk lokal berdasarkan parameter URL berkas.
  - Dilengkapi proteksi keamanan untuk mencegah serangan directory traversal.

---

## 📁 Struktur Direktori Uploads

Berkas yang diunggah akan disimpan secara lokal di direktori `uploads/`:
```text
backend_server/
├── uploads/
│   ├── payments/   # Bukti transfer pembayaran dari user
│   ├── documents/  # Berkas naskah asli (.pdf, .docx, .txt) dari user
│   └── results/    # File laporan PDF hasil Turnitin dari admin
```

---

## 🚀 Cara Menjalankan Server

### 1. Pasang Dependensi
Masuk ke direktori `backend_server` dan pasang npm package yang dibutuhkan:
```bash
npm install
```

### 2. Jalankan Server
Jalankan server penyimpanan statis:
```bash
node server.js
```
Secara default, server akan berjalan di port **5001** ([http://localhost:5001](http://localhost:5001)) dan menyajikan file statis di path `/uploads`.

---

## 🔗 Endpoints API

### 1. POST `/api/upload/:type`
* **Params**: `type` (`payments` | `documents` | `results`)
* **Body**: `file` (Form Data)
* **Response**:
```json
{
  "success": true,
  "filename": "1780808171258-naskah.pdf",
  "url": "http://localhost:5001/uploads/documents/1780808171258-naskah.pdf",
  "size": 439012
}
```

### 2. DELETE `/api/delete`
* **Body**: `{ "url": "http://localhost:5001/uploads/documents/1780808171258-naskah.pdf" }`
* **Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```
