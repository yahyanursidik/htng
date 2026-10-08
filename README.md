# PahamHitung
## Web Simulasi Penjumlahan SD — Fase A, B, C

Versi aplikasi: **0.2.0**. Lihat [catatan versi](CHANGELOG.md) untuk perubahan, batas cakupan, dan hasil verifikasi.

> Status: Lab penjumlahan + 30 aktivitas inti dengan contoh CPA + 14 permainan CPA + 60 contoh visual + kalkulator penjelas + akun pendamping lokal
> Stack utama: Astro 7.2+ · TypeScript · Preact · Node 24+ · SQLite  
> Design guardrail: Hallmark + project-specific Anti-AI-Slop  
> Fokus modul pertama: Penjumlahan

---

## Jalankan aplikasi lengkap

### Contoh visual kelas 1–6

Menu **Contoh** dan tombol **Contoh visual** di Belajar membuka `/contoh`: 5 konteks (mobil, motor, mangga, stroberi, semangka) × 12 konsep dasar. Filter kelas/benda, lalu buka penjelasan CPA dan latihan dengan bilangan berbeda. Ini pendamping materi, bukan seluruh silabus SD.

- Benda konkret berupa kegiatan aman bersama pendamping; SVG di layar adalah representasi gambar. Kendaraan menggunakan mainan/kartu, pecahan menggunakan kertas, tanpa jalan raya atau pisau.
- Satu gambar mewakili satu unit kecuali keranjang yang jumlah isinya disebutkan. Pengurangan mencoret benda awal; kelompok puluhan berisi 10; pembagian bergiliran mempertahankan total; pecahan memakai satu utuh berukuran sama dengan bagian sama besar.
- Domain `src/learning/visual-examples/engine.ts` menggunakan generator kurikulum, seed deterministik, serta bank variasi yang mengecualikan contoh terbimbing. Evaluator kurikulum memeriksa bilangan dan alasan secara terpisah; tiga petunjuk membuka konsep, cara, lalu hasil. Menandai gambar tidak mengubah jumlah. Gambar boleh disembunyikan/dibuka manual jika seluruh informasi tetap tersedia pada soal.
- Bukti percobaan hanya di memori selama latihan terbuka: seed, jawaban/alasan, ketepatan, petunjuk, gambar, tanda hitung, dan pembagian. Tidak menulis profil, localStorage, atau Catatan keluarga; tidak menyatakan penguasaan mandiri. Pergantian latihan/halaman menghapus bukti sementara.
- Penjelasan dan semua tautan tetap terbaca tanpa JavaScript. Interaksi memakai kontrol native, fokus keyboard, penamaan gambar, target 48 px, reduced motion, dan tata letak responsif.
- Tes: `tests/unit/visual-examples.test.ts`, `tests/components/VisualExample.test.tsx`, dan `tests/e2e/visual-examples.spec.ts`. Jalankan pemeriksaan yang tercantum di bawah sebelum menyerahkan perubahan.

### Server lokal

Node.js 24 atau lebih baru diperlukan untuk SQLite dan modul TypeScript yang dibaca backend. Tidak diperlukan layanan auth eksternal atau API key.

```powershell
npm install
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run build
npm start
```

Buka [PahamHitung](http://127.0.0.1:4322/). Gunakan alamat `127.0.0.1`, bukan `localhost`, karena origin harus persis sama untuk permintaan akun.

Daftar dengan akun pendamping → tambah profil anak → pilih kelas → belajar → buka Catatan. Akun asli disimpan pada `data/mathyahya.sqlite`, bukan localStorage. Akun hanya berlaku pada server yang sama. Data tetap ada setelah server dihidupkan ulang. Mode tamu tetap tersedia tanpa login.

Identitas layanan adalah **PahamHitung**. Logo asli ada di `public/brand/pahamhitung-logo.png`; komponen `Brand.astro` menyesuaikan ruang kosong gambar tanpa mengubah aset. Nama berkas database, cookie sesi, dan kunci catatan browser lama sengaja tetap dipakai agar pergantian nama tidak menghilangkan akun maupun riwayat.

Untuk pengembangan dengan hot reload, jalankan **dua terminal**:

```powershell
# Terminal backend
$env:PORT='4323'
$env:APP_ORIGIN='http://127.0.0.1:4322'
npm run dev:api
```

```powershell
# Terminal frontend
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run dev -- --host 127.0.0.1 --port 4322
```

Hentikan server `npm start` sebelum menjalankan frontend pada port yang sama. `astro preview` hanya mempratinjau berkas statis; login membutuhkan backend. Backend dev menggunakan proxy `/api` ke 4323.

```powershell
npm run test:all
```

Menjalankan pemeriksaan tipe, unit/component tests, tes API/security, build, dan Playwright. Tes API dan Playwright memakai database terpisah dalam memori, tidak mengubah data keluarga asli.

Lihat [kontrak pengembangan SD dan akun](SD-LEARNING-AND-ACCOUNTS.md) untuk API, penyimpanan, batas cakupan, dan persiapan deployment. Versi ini belum mencakup seluruh silabus SD, verifikasi/pemulihan email, atau deployment cloud. Jangan deploy output statis saja dan menganggap fitur akun sudah tersedia.

## Kalkulator penjelas

Buka `/kalkulator` dari navigasi utama atau lab. Masukkan dua bilangan dan pilih tambah, kurang, kali, atau bagi. Hasil disertai langkah nilai tempat/dekomposisi/pembagian dan pemeriksaan dengan operasi kebalikannya. Tersedia contoh yang dapat diubah. Desimal menerima koma atau titik, tanpa pemisah ribuan, maksimal 6 digit sebelum dan 3 digit sesudah pemisah; bilangan negatif didukung. Ekspresi bertingkat, persen, dan input pecahan belum termasuk cakupan.

Mesin murni `src/learning/calculator/engine.ts` memakai pecahan BigInt agar desimal tidak mengalami galat floating-point. Pembagian nol dijelaskan dan ditolak. Jika hasil tidak mempunyai desimal tepat hingga 6 tempat, tampilkan pecahan tepat dan pendekatan desimal bertanda ≈ (pembulatan setengah menjauh dari nol). Langkah dan pemeriksaan selalu memakai nilai tepat. Kalkulator sepenuhnya lokal, tidak memanggil API, tidak menyimpan angka/hasil, dan tidak menambah evidence atau penguasaan pada profil anak. UI satu Preact island; Enter menghitung, hasil menerima fokus, edit menghapus hasil lama, kesalahan terkait input, gerakan berkurang dihormati. Domain/component/Playwright menguji hasil, langkah, validasi, keyboard, responsif, dan regresi navigasi.

Runner Playwright menerima argumen CLI, misalnya `npm run test:e2e -- --workers=2` jika pengujian paralel membebani komputer.

---

## 1. Visi Produk

Pengayaan CPA: buka `/cpa` untuk permainan benda–gambar–simbol kelas 1–6. Setiap materi pada `/belajar` juga mempunyai contoh CPA terbimbing. Catatan permainan CPA hanya di browser, terpisah dari profil akun. Lihat [kontrak CPA](CPA-LEARNING-CONTRACT.md) untuk representasi, interaksi, generator, evidence, aksesibilitas, dan pengujian.

PahamHitung bukan situs kumpulan soal dan bukan game drilling.

Produk ini adalah **lingkungan belajar matematika** yang membantu anak bergerak dari pengalaman nyata menuju pemahaman simbolik:

**REAL OBJECT → BUILD → SEE → MOVE → MODEL → WRITE → EXPLAIN → USE → INDEPENDENT**

Tujuan utama bukan membuat anak cepat menghafal fakta penjumlahan, melainkan membantu anak:

1. memahami makna kuantitas;
2. memahami operasi penjumlahan;
3. berpindah antarrepresentasi;
4. menemukan dan membandingkan strategi;
5. menjelaskan pemikiran;
6. memeriksa kewajaran jawaban;
7. menggunakan matematika dalam kehidupan sehari-hari;
8. berkembang dari bantuan menuju kemandirian.

---

## 2. Prinsip Produk

### Pedagogy before technology
Teknologi tidak menentukan pembelajaran. Kebutuhan belajar menentukan komponen teknologi yang dipakai.

### Understanding before speed
Kecepatan bukan indikator utama kecerdasan matematika.

### Concrete before abstract
Anak diberi pengalaman konkret/nyata sebelum simbol matematika ketika konsep masih baru.

### Multiple representations
Satu konsep perlu dapat dilihat melalui benda, counter, ten-frame, number line, part-whole, base-ten, dan simbol.

### Multiple strategies
Satu jawaban dapat dicapai melalui beberapa strategi yang masuk akal.

### Explain, not merely answer
Sistem menilai proses berpikir, bukan hanya hasil akhir.

### Scaffold, then fade
Dukungan diberikan saat diperlukan dan dikurangi ketika anak semakin mandiri.

### Transfer to life
Matematika harus muncul kembali dalam konteks rumah, kelas, kegiatan, pengukuran, waktu, benda, dan lingkungan sekitar anak.

---

## 3. Dokumen Project Foundation

Baca dokumen dalam urutan berikut:

1. `PROJECT-BRIEF.md`
2. `LEARNING-ARCHITECTURE.md`
3. `PHASE-A-B-C-SKILL-MAP.md`
4. `ADDITION-LEARNING-ENGINE.md`
5. `UI-UX-CHILD-ANTI-SLOP.md`
6. `TECH-ARCHITECTURE.md`
7. `HALLMARK-WORKFLOW.md`
8. `AI-CODING-INSTRUCTIONS.md`

Jangan mulai membuat halaman sebelum memahami dokumen 1–5.

---

## 4. Aturan Prioritas

Jika terjadi konflik instruksi, gunakan urutan:

1. keselamatan dan accessibility anak;
2. tujuan pedagogik;
3. cognitive load;
4. usability;
5. project design system;
6. Hallmark;
7. preferensi estetika;
8. novelty/animation.

Desain yang indah tetapi mengganggu pemahaman matematika harus ditolak.

---

## 5. MVP

MVP pertama hanya Fase A.

Fokus:

- quantity;
- joining;
- counting-on;
- part-part-whole;
- number bonds;
- make 5;
- make 10;
- doubles sederhana;
- ten-frame;
- number line;
- simple story problem;
- explain thinking;
- everyday transfer.

Jangan membangun Fase B dan C sebelum pola interaksi Fase A diuji dengan anak.

---

## 6. Definisi Keberhasilan

Produk dianggap berhasil jika anak semakin mampu menjawab:

- **Can I build it?**
- **Can I see it?**
- **Can I write it?**
- **Can I explain it?**
- **Can I use it?**
- **Can I choose a strategy?**

Bukan sekadar jika anak mengerjakan banyak soal.

---

## 7. Panduan dan kalkulator bersusun

`/bersusun` menjelaskan tambah, kurang, kali, dan bagi lewat nilai tempat, pertukaran, hasil bagian, dan sisa. Contoh beserta seluruh penjelasannya tersedia tanpa JavaScript. `/kalkulator?cara=bersusun` membuka mode bersusun; Cara biasa tetap mendukung desimal, negatif, dan pecahan tepat.

Mesin murni `src/learning/calculator/column-engine.ts` menghasilkan snapshot tabel per langkah; komponen `ColumnDiagram` menampilkan baris dan kolom semantik, sedangkan `ColumnSolution` mengatur navigasi/fokus keyboard. Pengurangan mempertahankan nilai bilangan awal pada setiap pertukaran, termasuk lintasan nol; perkalian menjumlahkan hasil bagian sesuai tempat; pembagian mempertahankan nol hasil bagi dan memeriksa `a = b × q + r`, `0 ≤ r < b`. Tidak ada penyimpanan, pengiriman bilangan, atau penambahan evidence/mastery dari membaca solusi.

Setiap snapshot memiliki `guidance` (arah, instruksi, dan `cues` dengan koordinat baris/kolom sumber serta tujuan). Diagram memakai metadata ini, bukan menebak dari judul langkah: biru untuk baca, kuning dengan garis putus-putus untuk pertukaran, hijau dengan garis ganda untuk hasil yang ditulis. Panah SVG mengikuti kolom dan baris tabel yang sama; label teks serta keterangan sel menyampaikan maknanya tanpa warna. Garis hasil, garis pengurangan, dan kurung pembagian tetap konvensional. Pembagian memisahkan bagi, kalikan, kurangi, serta turunkan menjadi langkah manual; digit berikutnya tidak ditampilkan sebelum waktunya. Bantuan ini bukan penilaian kemampuan anak dan tidak memakai autoplay atau animasi.

Batas bersusun: masukan digit bilangan bulat 0–9999 tanpa pemisah ribuan; pengali maksimal 999, pembagi 1–99, dan pengurangan tidak menghasilkan negatif. Masukan di luar batas ditolak dengan arahan ke Cara biasa, bukan dibulatkan/dipotong. Hasil perkalian dapat mencapai tujuh digit. Tes mencakup snapshot deterministik, invariant nilai tempat, kasus nol/sisa, fokus/error/reset, keyboard, ukuran layar 320–1440, teks 200%, reduced motion, dan panduan tanpa JavaScript.

## 8. Hallmark

Hallmark digunakan sebagai lapisan kualitas desain dan anti-AI-slop.

Install:

```bash
npx skills add nutlope/hallmark
```

Sumber:
- https://github.com/nutlope/hallmark
- https://www.usehallmark.com/

Hallmark tidak menggantikan design system project ini.

Gunakan `HALLMARK-WORKFLOW.md` untuk prosedur kerja.
