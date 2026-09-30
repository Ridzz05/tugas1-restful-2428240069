import html
import zipfile
from pathlib import Path
OUT = Path(__file__).with_name('Laporan_Tugas1_2428240069_M_Rizki_Algipari.docx')
def p(text='',style=None,align=None,bold=False,size=None,shade=None):
 attrs=(f' w:style="{style}"' if style else '')+(f' w:jc="{align}"' if align else '')+(f' w:shd="{shade}"' if shade else '')
 rp='<w:rPr>'+('<w:b/>' if bold else '')+(f'<w:sz w:val="{size}"/>' if size else '')+'<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr>'
 return f'<w:p><w:pPr>{attrs}<w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:r>{rp}<w:t xml:space="preserve">{html.escape(text)}</w:t></w:r></w:p>'
def heading(s,n=1): parts.append(p(s,style=f'Heading{n}',bold=True,size=28 if n==1 else 24))
def para(s): parts.append(p(s))
def table(rows):
 o=['<w:tbl><w:tblPr><w:tblBorders>']
 for e in ['top','left','bottom','right','insideH','insideV']: o.append(f'<w:{e} w:val="single" w:sz="4" w:color="666666"/>')
 o.append('</w:tblBorders></w:tblPr>')
 for ri,row in enumerate(rows):
  o.append('<w:tr>')
  for x in row: o.append('<w:tc><w:tcPr><w:shd w:fill="'+('D9EAF7' if ri==0 else 'FFFFFF')+'"/></w:tcPr>'+p(str(x),bold=ri==0,size=16)+'</w:tc>')
  o.append('</w:tr>')
 o.append('</w:tbl>'); return ''.join(o)
parts=[]
for _ in range(3): parts.append(p(''))
for s in ['LAPORAN PRAKTIKUM','TUGAS 1: RESTFUL API MURNI DENGAN EXPRESS.JS','','TOPIK 14','GALERI SENI — LUKISAN','','','','Disusun oleh:','M. Rizki Algipari','NIM 2428240069','Kelas SI5B | Absen 14','','','','PROGRAM STUDI SISTEM INFORMASI','2026']:
 parts.append(p(s,align='center',bold=s not in ('','Disusun oleh:'),size=32 if s.startswith(('LAPORAN','TUGAS 1')) else 28))
parts.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
heading('1. Tujuan Praktikum')
for s in ['Memahami pembuatan project Node.js dan Express.js serta menyiapkan aplikasi untuk lokal dan serverless.','Menerapkan routing RESTful untuk lukisan dengan GET, POST, PUT, DELETE, parameter ID, dan filter query string.','Menerapkan validasi field wajib, ID otomatis, dan status code yang sesuai untuk kondisi berhasil maupun gagal.','Menyajikan response JSON dan menguji endpoint menggunakan klien API.']: para('• '+s)
heading('2. Dasar Teori'); heading('2.1 REST dan resource',2)
para('REST (Representational State Transfer) merupakan gaya arsitektur untuk mengelola resource melalui URL dan method HTTP. Resource praktikum adalah koleksi lukisan pada /paintings. Identitas satu lukisan berada pada parameter :id.')
heading('2.2 Method HTTP dan status code',2)
para('GET membaca data, POST membuat resource, PUT mengganti seluruh representasi resource, dan DELETE menghapus resource. API memakai status 200 untuk operasi sukses selain pembuatan, 201 untuk pembuatan, 400 untuk request tidak valid, dan 404 untuk data atau endpoint yang tidak tersedia.')
heading('2.3 JSON dan Express.js',2)
para('JSON (JavaScript Object Notation) adalah format pertukaran data ringan berbasis objek dan array. Express.js merupakan framework Node.js untuk middleware dan routing HTTP. express.json() mengurai body JSON. Data project disimpan dalam array di memori, bukan database, sehingga perubahan bisa hilang saat proses dimulai ulang.')
para('Sumber: Fielding, R. T. (2000), Architectural Styles and the Design of Network-based Software Architectures, Bab 5, https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm ; Express.js Documentation, https://expressjs.com/.')
heading('3. Alat dan Bahan')
for s in ['Node.js v26.7.0 (lingkungan pengerjaan; tugas merekomendasikan Node.js LTS).','npm v11.9.0.','Express.js dan nodemon (versi ada di package.json).','Editor: ____________________.','Tool API: Postman / Thunder Client / Insomnia (pilih yang digunakan).','GitHub: Ridzz05; repository tugas1-restful-2428240069.','Akun Vercel: ____________________.']: para('• '+s)
heading('4. Langkah Praktikum'); heading('4.1 Inisialisasi project',2)
para('Project memakai Express.js sebagai dependency dan nodemon sebagai devDependency. package.json memiliki npm start dan npm run dev; .gitignore mengecualikan node_modules, .env, dan .vercel. Jalankan npm install lalu npm run dev. Port berasal dari PORT lingkungan atau 3000.')
heading('4.2 Data awal dan middleware',2)
para('app.js memasang express.json() dan array paintings dengan tiga data awal. nextId dihitung dari ID terbesar ditambah satu. Field wajib: judul, pelukis, aliran (string), dan harga (number non-negatif). tahunDibuat opsional dan harus integer non-negatif jika disediakan.')
heading('4.3 Routing dan validasi',2)
para('GET / mengembalikan info API; GET /paintings mengembalikan data atau filter dari req.query.aliran; GET /paintings/:id mengambil satu lukisan. POST memvalidasi field dan membuat ID otomatis. PUT mengganti seluruh data setelah validasi. DELETE menghapus item dan mengembalikan data null. Error serta endpoint yang tidak ada dibalas dengan JSON.')
para('Body POST/PUT: { "judul": "Senja di Musi", "pelukis": "Rahmat Hidayat", "aliran": "realisme", "tahunDibuat": 2023, "harga": 7500000 }')
heading('4.4 Pengujian dengan klien API',2)
para('Import postman_collection.json. Atur baseUrl ke http://localhost:3000 atau URL Vercel. Jalankan request, lalu tempel bukti asli yang memperlihatkan request, response, dan status code. Jangan mengisi placeholder screenshot tanpa melakukan pengujian.')
for i,s in enumerate(['GET / info API','GET /paintings semua data','GET /paintings/1 detail','GET /paintings/99 404','GET /paintings?aliran=realisme filter','POST /paintings berhasil 201','POST /paintings field kosong 400','PUT /paintings/1 berhasil 200','PUT /paintings/99 404','DELETE /paintings/3 berhasil 200','DELETE /paintings/99 404','GET /endpoint-salah catch-all 404'],1):
 parts.append(p(f'[TEMPEL SCREENSHOT {i}: {s}]',align='center',bold=True,size=20,shade='EEEEEE')); para('Area screenshot (request + response + status code):'); para('..............................................................................................'); para('..............................................................................................')
heading('4.5 GitHub dan Vercel',2)
para('Repository: https://github.com/Ridzz05/tugas1-restful-2428240069. vercel.json mengarahkan request ke app.js. Express app diekspor dan app.listen hanya berjalan di lokal. Impor repository lewat dashboard Vercel, deploy, catat URL, dan uji ulang endpoint. Array memori dapat kembali ke awal saat runtime serverless dimulai ulang.')
heading('5. Hasil Pengujian')
para('Isi hasil berdasarkan pengujian nyata. Pengujian laporan dilakukan pada URL Vercel dan dibuktikan screenshot.')
parts.append(table([['No','Method','Endpoint','Request','Harapan','Hasil','Catatan'],['1','GET','/paintings','—','200','____','____'],['2','GET','/paintings/1','—','200','____','____'],['3','GET','/paintings/99','—','404','____','____'],['4','GET','/paintings?aliran=realisme','—','200','____','____'],['5','POST','/paintings','Body lengkap','201','____','____'],['6','POST','/paintings','judul kosong','400','____','____'],['7','PUT','/paintings/1','Body lengkap','200','____','____'],['8','PUT','/paintings/99','Body lengkap','404','____','____'],['9','DELETE','/paintings/1','—','200','____','____'],['10','DELETE','/paintings/99','—','404','____','____'],['11','GET','/tidak-ada','—','404','____','____']]))
heading('6. Pembahasan')
para('GET membaca tanpa mengubah array. POST menambah item dan ID dari server. PUT melakukan penggantian penuh dan memvalidasi semua field wajib. DELETE menghapus resource. Status code membedakan sukses, validasi gagal, dan data tidak ditemukan. Filter aliran menggunakan query string sesuai ketentuan.')
para('Kendala nyata dan solusinya: [ISI BERDASARKAN PENGALAMAN]. URL/hasil Vercel: [ISI SETELAH DEPLOY]. Data memori dapat kembali ke awal saat runtime serverless diganti.')
heading('7. Kesimpulan')
para('Praktikum membuat RESTful API resource lukisan dengan Express.js, meliputi CRUD, filter query string, validasi, ID otomatis, dan response JSON dengan status code sesuai. Lengkapi URL Vercel, bukti pengujian, screenshot, dan kendala nyata sebelum dikumpulkan.')
heading('8. Lampiran')
para('Repository: https://github.com/Ridzz05/tugas1-restful-2428240069')
para('Vercel: [ISI SETELAH DEPLOY]')
para('Riwayat commit: [TEMPEL SCREENSHOT git log --oneline, minimal 5 commit]')
para('Draft harus diperiksa dan dilengkapi bukti asli, URL deployment, versi alat yang benar, serta ketentuan kampus sebelum diekspor ke PDF.')
xml='<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join(parts)+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1152" w:right="1440" w:bottom="1152" w:left="1440"/></w:sectPr></w:body></w:document>'
styles='<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>'
ct='<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
rels='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
drels='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('[Content_Types].xml',ct); z.writestr('_rels/.rels',rels); z.writestr('word/document.xml',xml); z.writestr('word/styles.xml',styles); z.writestr('word/_rels/document.xml.rels',drels)
print('Created',OUT)
