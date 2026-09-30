# Tugas 1 RESTful API — Lukisan

RESTful API murni untuk resource **lukisan** (Topik 14, Galeri Seni), dibuat dengan Node.js dan Express.js. Data menggunakan array di memori, sehingga akan kembali ke data awal ketika proses server/serverless runtime dimulai ulang.

## Identitas
- **Nama:** M. Rizki Algipari
- **NIM:** 2428240069
- **Kelas:** SI5B
- **Nomor topik:** 14 — Galeri Seni: Lukisan
- **Resource:** `/paintings`

## Repository dan deployment
- GitHub: https://github.com/Ridzz05/tugas1-restful-2428240069
- Vercel: `TAMBAHKAN_URL_VERCEL_SETELAH_DEPLOY`

## Menjalankan secara lokal
Persyaratan: Node.js LTS dan npm.

```bash
npm install
npm run dev
```

API berjalan di `http://localhost:3000`. Untuk menjalankan tanpa nodemon: `npm start`.

## Endpoint
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Informasi API, identitas, dan daftar endpoint |
| GET | `/paintings` | Ambil semua lukisan |
| GET | `/paintings/:id` | Ambil satu lukisan berdasarkan ID |
| GET | `/paintings?aliran=realisme` | Filter lukisan berdasarkan aliran |
| POST | `/paintings` | Tambah lukisan (JSON; semua field wajib) |
| PUT | `/paintings/:id` | Ganti seluruh data lukisan |
| DELETE | `/paintings/:id` | Hapus lukisan |

### Field
`judul` (string, wajib), `pelukis` (string, wajib), `aliran` (string, wajib), `harga` (number non-negatif, wajib), `tahunDibuat` (integer non-negatif, opsional).

Contoh body POST/PUT:
```json
{
  "judul": "Senja di Musi",
  "pelukis": "Rahmat Hidayat",
  "aliran": "realisme",
  "tahunDibuat": 2023,
  "harga": 7500000
}
```

GET mengembalikan objek/array secara langsung. POST, PUT, DELETE, dan error menggunakan `{ "status", "message", "data" }`. Request yang membutuhkan body harus memakai `Content-Type: application/json`.

## Pengujian
Import `postman_collection.json` ke Postman. Variabel koleksi `baseUrl` default-nya `http://localhost:3000`; setelah deploy, ubah nilainya ke URL Vercel.

## Deployment ke Vercel
Repository memakai `vercel.json` dan mengekspor Express app agar dijalankan sebagai function. Hubungkan repository publik ini melalui dashboard Vercel, deploy, lalu ubah URL di atas. Array data bersifat sementara dan dapat kembali ke data awal karena karakteristik serverless.
