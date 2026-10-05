# PahamHitung
## Web Simulasi Penjumlahan SD — Fase A, B, C

> Status: Lab penjumlahan + 30 aktivitas inti dengan contoh CPA + 14 permainan CPA + akun pendamping lokal  
> Stack utama: Astro 7.2+ · TypeScript · Preact · Node 24+ · SQLite  
> Design guardrail: Hallmark + project-specific Anti-AI-Slop  
> Fokus modul pertama: Penjumlahan

---

## Jalankan aplikasi lengkap

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

## 7. Hallmark

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
