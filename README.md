# tugas1-restful-2428240069

RESTful API Express.js sederhana untuk data lukisan (galeri seni).

- **Nama:** M. Rizki Algipari
- **NIM:** 2428240069
- **Kelas:** SI5B
- **Absen:** 14
- **Topik:** Topik 14 — Galeri Seni: Lukisan
- **Resource:** `/paintings`

## Tautan

**Repository GitHub:** https://github.com/Ridzz05/tugas1-restful-2428240069
**Deployment Vercel:** https://tugas1-restful-2428240069.vercel.app

## Cara Menjalankan Lokal

```bash
npm install
npm start
```

Mode development (auto-restart dengan nodemon):

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

## Struktur Field Lukisan

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | number | otomatis | Dibuat otomatis oleh server |
| `judul` | string | ya | Judul lukisan |
| `pelukis` | string | ya | Nama pelukis |
| `aliran` | string | ya | Aliran seni (bebas, tanpa daftar pilihan) |
| `tahunDibuat` | number | tidak | Tahun pembuatan |
| `harga` | number | ya | Harga lukisan |

## Daftar Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Informasi API |
| GET | `/paintings` | Semua data lukisan |
| GET | `/paintings?aliran=realisme` | Filter data berdasarkan aliran |
| GET | `/paintings/:id` | Satu data lukisan berdasarkan id |
| POST | `/paintings` | Menambah data lukisan |
| PUT | `/paintings/:id` | Mengubah seluruh field data lukisan |
| DELETE | `/paintings/:id` | Menghapus data lukisan |

Endpoint lain akan menghasilkan `404` dengan pesan `Endpoint tidak ditemukan`.

## Contoh Body POST

```json
{
  "judul": "Senja di Musi",
  "pelukis": "Rahmat Hidayat",
  "aliran": "realisme",
  "tahunDibuat": 2023,
  "harga": 7500000
}
```

## Contoh Body PUT

```json
{
  "judul": "Senja di Musi (Revisi)",
  "pelukis": "Rahmat Hidayat",
  "aliran": "impresionisme",
  "tahunDibuat": 2024,
  "harga": 8000000
}
```

`tahunDibuat` bersifat opsional. Jika tidak dikirim saat `PUT`, nilainya menjadi `null`.
