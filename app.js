// ===========================================================================
// Tugas 1 - RESTful API Express.js
// Nama    : M. Rizki Algipari
// NIM     : 2428240069
// Kelas   : SI5B
// Topik 14: Galeri Seni - Lukisan
// Resource: /paintings
// ===========================================================================

// Impor modul express
const express = require("express");

// Membuat instance aplikasi Express
const app = express();

// Middleware bawaan Express untuk membaca body request berformat JSON (req.body)
app.use(express.json());

// ---------------------------------------------------------------------------
// Data awal lukisan (disimpan di memori, tanpa database)
// ---------------------------------------------------------------------------
let paintings = [
  // Data lukisan ke-1
  {
    id: 1,
    judul: "Senja di Musi",
    pelukis: "Rahmat Hidayat",
    aliran: "realisme",
    tahunDibuat: 2023,
    harga: 7500000,
  },
  // Data lukisan ke-2
  {
    id: 2,
    judul: "Tari Cahaya Pagi",
    pelukis: "Siti Nurhaliza",
    aliran: "impresionisme",
    tahunDibuat: 2021,
    harga: 5200000,
  },
  // Data lukisan ke-3
  {
    id: 3,
    judul: "Bentuk Tanpa Nama",
    pelukis: "Bagas Prasetyo",
    aliran: "abstrak",
    tahunDibuat: 2024,
    harga: 9800000,
  },
];

// Penomoran id otomatis untuk data baru (lanjutan dari id terakhir data awal)
let nextId = 4;

// ---------------------------------------------------------------------------
// Fungsi bantu validasi body lukisan
// Mengembalikan pesan error (string) bila tidak valid, atau null bila valid
// ---------------------------------------------------------------------------
function validasiLukisan(body) {
  // Field string wajib: judul, pelukis, aliran
  const fieldString = ["judul", "pelukis", "aliran"];

  // Cek tiap field string: harus ada, bertipe string, dan tidak kosong setelah trim
  for (const field of fieldString) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return `Field ${field} wajib diisi`;
    }
  }

  // Field harga wajib berupa number (bukan string) dan bukan NaN
  if (typeof body.harga !== "number" || Number.isNaN(body.harga)) {
    return "Field harga wajib diisi dan harus berupa angka";
  }

  // Field tahunDibuat opsional: bila dikirim harus number dan bukan NaN
  if (
    body.tahunDibuat !== undefined &&
    body.tahunDibuat !== null &&
    (typeof body.tahunDibuat !== "number" || Number.isNaN(body.tahunDibuat))
  ) {
    return "Field tahunDibuat harus berupa angka";
  }

  // Lolos semua validasi
  return null;
}

// ---------------------------------------------------------------------------
// GET /
// Menampilkan informasi API
// Response: 200 { nama, nim, kelas, topik, resource, endpoints }
// ---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    nama: "M. Rizki Algipari",
    nim: "2428240069",
    kelas: "SI5B",
    topik: "Topik 14 - Galeri Seni: Lukisan",
    resource: "/paintings",
    endpoints: [
      "GET /",
      "GET /paintings",
      "GET /paintings/:id",
      "GET /paintings?aliran=<aliran>",
      "POST /paintings",
      "PUT /paintings/:id",
      "DELETE /paintings/:id",
    ],
  });
});

// ---------------------------------------------------------------------------
// GET /paintings
// Mengambil seluruh data lukisan (array langsung, tanpa wrapper)
// Query opsional: ?aliran=<aliran> untuk memfilter berdasarkan aliran
// Response: 200 [ ... ]
// ---------------------------------------------------------------------------
app.get("/paintings", (req, res) => {
  // Filter berdasarkan query aliran bila dikirim
  if (req.query.aliran) {
    const hasil = paintings.filter((p) => p.aliran === req.query.aliran);
    return res.status(200).json(hasil);
  }

  // Tanpa query: kembalikan semua data
  res.status(200).json(paintings);
});

// ---------------------------------------------------------------------------
// GET /paintings/:id
// Mengambil satu data lukisan berdasarkan id
// Response: 200 <objek> | 404 { status, message, data }
// ---------------------------------------------------------------------------
app.get("/paintings/:id", (req, res) => {
  // Konversi parameter id (string) menjadi number
  const id = Number(req.params.id);

  // Cari data dengan id yang cocok
  const lukisan = paintings.find((p) => p.id === id);

  // Bila tidak ditemukan
  if (!lukisan) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  // Bila ditemukan: kirim objek langsung
  res.status(200).json(lukisan);
});

// ---------------------------------------------------------------------------
// POST /paintings
// Menambah data lukisan baru
// Body: { judul, pelukis, aliran, tahunDibuat?, harga }
// Response: 201 { status, message, data } | 400 { status, message, data }
// ---------------------------------------------------------------------------
app.post("/paintings", (req, res) => {
  // Validasi seluruh field wajib
  const pesanError = validasiLukisan(req.body);

  // Bila validasi gagal
  if (pesanError) {
    return res.status(400).json({
      status: "error",
      message: pesanError,
      data: null,
    });
  }

  // Membuat objek lukisan baru dengan id otomatis
  const lukisanBaru = {
    id: nextId, // id dari penomoran otomatis
    judul: req.body.judul,
    pelukis: req.body.pelukis,
    aliran: req.body.aliran,
    tahunDibuat: req.body.tahunDibuat ?? null, // opsional
    harga: req.body.harga,
  };

  // Simpan ke array data
  paintings.push(lukisanBaru);

  // Naikkan penomoran id untuk data berikutnya
  nextId++;

  // Kirim respons sukses
  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: lukisanBaru,
  });
});

// ---------------------------------------------------------------------------
// PUT /paintings/:id
// Mengubah seluruh field lukisan (kecuali id) berdasarkan id
// Body: { judul, pelukis, aliran, tahunDibuat?, harga }
// Response: 200 { status, message, data } | 400 | 404
// ---------------------------------------------------------------------------
app.put("/paintings/:id", (req, res) => {
  // Konversi parameter id menjadi number
  const id = Number(req.params.id);

  // Cari index data dengan id yang cocok
  const index = paintings.findIndex((p) => p.id === id);

  // Bila data tidak ditemukan
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  // Validasi seluruh field wajib
  const pesanError = validasiLukisan(req.body);

  // Bila validasi gagal
  if (pesanError) {
    return res.status(400).json({
      status: "error",
      message: pesanError,
      data: null,
    });
  }

  // Mengganti SELURUH field selain id (tahunDibuat menjadi null bila tidak dikirim)
  const lukisanDiperbarui = {
    id: id,
    judul: req.body.judul,
    pelukis: req.body.pelukis,
    aliran: req.body.aliran,
    tahunDibuat: req.body.tahunDibuat ?? null,
    harga: req.body.harga,
  };

  // Timpa data lama dengan data hasil perubahan
  paintings[index] = lukisanDiperbarui;

  // Kirim respons sukses
  res.status(200).json({
    status: "success",
    message: `Data lukisan dengan id ${id} berhasil diperbarui`,
    data: lukisanDiperbarui,
  });
});

// ---------------------------------------------------------------------------
// DELETE /paintings/:id
// Menghapus data lukisan berdasarkan id
// Response: 200 { status, message, data } | 404 { status, message, data }
// ---------------------------------------------------------------------------
app.delete("/paintings/:id", (req, res) => {
  // Konversi parameter id menjadi number
  const id = Number(req.params.id);

  // Cari index data dengan id yang cocok
  const index = paintings.findIndex((p) => p.id === id);

  // Bila data tidak ditemukan
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  // Hapus satu data pada index tersebut
  paintings.splice(index, 1);

  // Kirim respons sukses
  res.status(200).json({
    status: "success",
    message: `Data lukisan dengan id ${id} berhasil dihapus`,
    data: null,
  });
});

// ---------------------------------------------------------------------------
// Catch-all: menangani endpoint yang tidak dikenal (diletakkan paling bawah)
// Response: 404 { status, message, data }
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    data: null,
  });
});

// ---------------------------------------------------------------------------
// Menjalankan server (hanya di luar mode production, mis. Vercel)
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

// Server hanya dijalankan saat lokal / development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// Ekspor app agar bisa dipakai Vercel (serverless) dan pengujian
module.exports = app;
