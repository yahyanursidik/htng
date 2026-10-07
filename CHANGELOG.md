# Catatan versi PahamHitung

Versi aplikasi dicatat pada `package.json` dan `package-lock.json`; tag Git memakai awalan `v`. Nomor mayor digunakan untuk perubahan tidak kompatibel, minor untuk fitur baru, dan patch untuk perbaikan. Seri 0.x masih dalam pengembangan dan belum mewakili seluruh silabus SD.

## v0.2.0

Tanggal: 2026-10-08. Pembaruan dari versi aplikasi 0.1.0 menambahkan contoh visual dan alat bantu memahami langkah hitung.

### Fitur baru

- Kalkulator penjelas di `/kalkulator` untuk tambah, kurang, kali, dan bagi. Desimal menggunakan perhitungan pecahan tepat; hasil mencakup langkah serta pemeriksaan dengan operasi kebalikan. Bilangan negatif, pembagian nol, pecahan hasil, dan pendekatan desimal ditangani secara eksplisit.
- 60 contoh visual di `/contoh`: mobil, motor, mangga, stroberi, dan semangka pada 12 konsep dasar kelas 1–6. Penjelasan benda–gambar–simbol diikuti latihan dengan angka berbeda, petunjuk bertahap, serta bukti percobaan sementara.
- Panduan operasi bersusun di `/bersusun` dan mode Bersusun di kalkulator. Diagram menjelaskan nilai tempat, menyimpan, pertukaran melewati nol, hasil bagian perkalian, nol dalam hasil bagi, serta sisa pembagian.

### Akses dan perilaku

- Tautan Contoh dan Kalkulator tersedia pada navigasi; halaman Belajar juga menyediakan akses panduan bersusun. Navigasi dapat membungkus agar tidak menyembunyikan tujuan pada layar kecil.
- Dukungan keyboard, fokus hasil dan langkah, kesalahan terkait input, target sentuh, reduced motion, serta tampilan responsif dan teks 200%.
- Panduan dan contoh terbimbing dapat dibaca tanpa JavaScript. Kalkulator memerlukan JavaScript, tetapi tidak menyimpan atau mengirim bilangan dan hasil. Membaca solusi tidak menambah bukti penguasaan.
- Runner Playwright menerima argumen CLI, termasuk `--workers=2` untuk komputer dengan sumber daya terbatas.

### Batas cakupan

- Bersusun menerima bilangan bulat 0–9999, pengali sampai 999, dan pembagi 1–99. Pengurangan bersusun memakai bilangan awal yang lebih besar atau sama. Desimal, negatif, dan hasil pembagian penuh tersedia pada Cara biasa.
- Kalkulator biasa menerima dua bilangan, bukan ekspresi bertingkat, masukan pecahan, atau persen. Contoh visual mendampingi materi yang tersedia, bukan menggantikan seluruh silabus SD.
- Tidak ada perubahan skema database, sistem akun, layanan eksternal, atau dependensi baru pada rilis ini.

### Verifikasi

- Astro check: 0 errors, 0 warnings, 0 hints.
- Unit dan komponen: 433 tes lulus; pengujian ulang mesin dan komponen bersusun: 19 tes lulus.
- Server dan keamanan: 2 tes lulus.
- Playwright Chromium: 34 tes lulus; pengujian ulang versi akhir bersusun: 5 tes lulus.
- Build: 130 halaman. Screenshot ditinjau pada 375, 768, 1024, dan 1440 piksel; pengujian juga mencakup 320/414 piksel, teks 200%, kontras, reduced motion, keyboard, dan panduan tanpa JavaScript.
