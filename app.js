// Mengimpor Express untuk membuat aplikasi REST API.
const express = require('express');

// Membuat instance aplikasi Express.
const app = express();

// Middleware untuk membaca request body berformat JSON.
app.use(express.json());

// Data awal lukisan disimpan dalam array di memori (tanpa database).
const paintings = [
  {
    id: 1,
    judul: 'Senja di Musi',
    pelukis: 'Rahmat Hidayat',
    aliran: 'realisme',
    tahunDibuat: 2023,
    harga: 7500000,
  },
  {
    id: 2,
    judul: 'Pasar 16 Ilir',
    pelukis: 'Siti Marwah',
    aliran: 'impresionisme',
    tahunDibuat: 2021,
    harga: 5200000,
  },
  {
    id: 3,
    judul: 'Jembatan Ampera',
    pelukis: 'Dimas Pratama',
    aliran: 'realisme',
    tahunDibuat: 2024,
    harga: 9100000,
  },
];

// ID baru dimulai dari angka setelah ID terbesar yang ada.
let nextId = Math.max(...paintings.map((painting) => painting.id)) + 1;

// Daftar field untuk lukisan. Tahun dibuat bersifat opsional.
const requiredFields = ['judul', 'pelukis', 'aliran', 'harga'];
const allowedFields = [...requiredFields, 'tahunDibuat'];

// Validasi body POST/PUT. Mengembalikan pesan kesalahan, atau null jika valid.
function validatePainting(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Body request harus berupa objek JSON';
  }

  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' && field !== 'harga') {
      return `Field ${field} wajib diisi`;
    }
    if (field !== 'harga' && body[field].trim() === '') {
      return `Field ${field} wajib diisi`;
    }
    if (field === 'harga' && (body.harga === '' || body.harga === null || body.harga === undefined)) {
      return 'Field harga wajib diisi';
    }
  }

  if (typeof body.harga !== 'number' || !Number.isFinite(body.harga) || body.harga < 0) {
    return 'Field harga harus berupa angka non-negatif';
  }

  if (Object.hasOwn(body, 'tahunDibuat') &&
      (!Number.isInteger(body.tahunDibuat) || body.tahunDibuat < 0)) {
    return 'Field tahunDibuat harus berupa bilangan bulat non-negatif';
  }

  return null;
}

// Membentuk objek baru dari field yang diizinkan; ID selalu ditentukan server.
function createPainting(body, id) {
  const painting = { id };
  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) painting[field] = body[field];
  }
  return painting;
}

// GET / - Informasi API dan daftar endpoint.
app.get('/', (req, res) => {
  res.json({
    nama: 'M. Rizki Algipari',
    nim: '2428240069',
    kelas: 'SI5B',
    nomorTopik: 14,
    topik: 'Galeri Seni - Lukisan',
    resource: '/paintings',
    endpoints: [
      'GET /paintings',
      'GET /paintings/:id',
      'POST /paintings',
      'PUT /paintings/:id',
      'DELETE /paintings/:id',
      'GET /paintings?aliran=realisme',
    ],
  });
});

// GET /paintings - Ambil semua lukisan atau filter berdasarkan aliran.
app.get('/paintings', (req, res) => {
  const { aliran } = req.query;
  const result = aliran === undefined
    ? paintings
    : paintings.filter((painting) => painting.aliran === aliran);
  res.json(result);
});

// GET /paintings/:id - Ambil satu lukisan berdasarkan ID.
app.get('/paintings/:id', (req, res) => {
  const id = Number(req.params.id);
  const painting = paintings.find((item) => item.id === id);

  if (!painting) {
    return res.status(404).json({
      status: 'error',
      message: `Data lukisan dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  return res.json(painting);
});

// POST /paintings
// Body: { "judul": "Senja di Musi", "pelukis": "Rahmat Hidayat", "aliran": "realisme", "tahunDibuat": 2023, "harga": 7500000 }
app.post('/paintings', (req, res) => {
  const validationError = validatePainting(req.body);
  if (validationError) {
    return res.status(400).json({
      status: 'error',
      message: validationError,
      data: null,
    });
  }

  const created = createPainting(req.body, nextId++);
  paintings.push(created);
  return res.status(201).json({
    status: 'success',
    message: 'Data lukisan berhasil ditambahkan',
    data: created,
  });
});

// PUT /paintings/:id
// Body: { "judul": "Senja di Musi", "pelukis": "Rahmat Hidayat", "aliran": "realisme", "tahunDibuat": 2023, "harga": 7500000 }
app.put('/paintings/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = paintings.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: `Data lukisan dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  const validationError = validatePainting(req.body);
  if (validationError) {
    return res.status(400).json({
      status: 'error',
      message: validationError,
      data: null,
    });
  }

  const updated = createPainting(req.body, id);
  paintings[index] = updated;
  return res.status(200).json({
    status: 'success',
    message: `Data lukisan dengan id ${id} berhasil diperbarui`,
    data: updated,
  });
});

// DELETE /paintings/:id - Hapus satu lukisan berdasarkan ID.
app.delete('/paintings/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = paintings.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: `Data lukisan dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }

  paintings.splice(index, 1);
  return res.status(200).json({
    status: 'success',
    message: `Data lukisan dengan id ${id} berhasil dihapus`,
    data: null,
  });
});

// Catch-all 404 - Semua endpoint yang tidak terdaftar.
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    data: null,
  });
});

// Error handler menjaga response error tetap JSON, termasuk JSON body yang malformed.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.status === 400 ? 400 : 500;
  return res.status(statusCode).json({
    status: 'error',
    message: statusCode === 400 ? 'Body JSON tidak valid' : 'Terjadi kesalahan pada server',
    data: null,
  });
});

// Server hanya listen saat file dijalankan langsung, bukan saat diimpor sebagai serverless function.
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
