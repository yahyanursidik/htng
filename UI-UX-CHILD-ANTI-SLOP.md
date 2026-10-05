# UI/UX CHILD + ANTI-AI-SLOP
## Project-Specific Design Guardrails

> Hallmark adalah quality layer. Dokumen ini lebih tinggi prioritasnya untuk child-learning UI.

---

# 1. Design Intent

Visual harus terasa:

- hangat;
- tenang;
- jelas;
- tactile;
- cerdas;
- playful secukupnya;
- tidak infantil;
- tidak terlihat seperti template AI;
- tidak terlihat seperti SaaS dashboard;
- tidak seperti mobile game monetization.

Anak harus tertarik pada **matematika yang sedang dimanipulasi**, bukan pada dekorasi UI.

---

# 2. Anti-AI-Slop Principle

## Decoration must mean something

Setiap elemen visual harus memiliki setidaknya satu fungsi:

- menunjukkan jumlah;
- menunjukkan grouping;
- menunjukkan hierarchy;
- memberi feedback;
- membantu navigasi;
- memberi affordance;
- memberi konteks nyata.

Jika tidak memiliki fungsi tersebut, hapus.

---

# 3. Subtract First

Sebelum menambahkan:
- card;
- gradient;
- illustration;
- icon;
- animation;
- badge;
- background pattern;

tanyakan:

> Apa yang terjadi jika elemen ini tidak ada?

Jika aktivitas tetap sama baiknya atau lebih jelas, elemen tidak diperlukan.

---

# 4. Forbidden AI-Slop Patterns

Hindari secara default:

- purple/blue neon gradient;
- glassmorphism;
- glowing blob;
- aurora background;
- generic floating cards;
- excessive rounded rectangles;
- setiap section berada dalam card;
- gradient text;
- huge generic headline + three feature cards;
- random stars/sparkles;
- fake 3D blobs;
- abstract mesh;
- dashboard aesthetic untuk anak;
- arbitrary shadows;
- meaningless icon badges;
- emoji sebagai visual language utama;
- decorative charts;
- excessive pill buttons;
- “AI startup” typography;
- generic stock illustration;
- mascot generated hanya untuk mengisi ruang;
- confetti setiap success;
- infinite micro-animation.

---

# 5. Child-EdTech Slop Patterns

Jangan otomatis membuat:

- kartun roket;
- planet;
- peta petualangan;
- treasure chest;
- mahkota;
- coins;
- stars;
- XP;
- pet;
- daily streak;
- hearts/lives;
- leaderboard;
- “level up!”;
- rainbow overload.

Semua itu memindahkan fokus dari aktivitas matematika.

---

# 6. Visual Subject

Prioritaskan:

- counter;
- dot;
- block;
- tile;
- garis;
- grid;
- frame;
- number card;
- benda rumah/sekolah yang relevan;
- tekstur ringan yang membantu tactile feeling.

Tidak perlu objek manusia/hewan untuk membuat pengalaman menarik.

---

# 7. Islamic Visual Boundary

Jangan menggunakan Islam sebagai dekorasi visual.

Hindari:
- kubah;
- masjid dekoratif;
- bulan-bintang;
- lentera;
- tasbih;
- arch;
- kaligrafi dekoratif;
- pattern pseudo-Islamic yang tidak berfungsi.

Islamic worldview diwujudkan melalui adab belajar, ketelitian, kesabaran, kemanfaatan, dan bahasa yang baik.

---

# 8. Layout Rule

## Learning workspace

```text
┌──────────────────────────────┐
│ context / prompt             │
│                              │
│ PRIMARY MATHEMATICAL OBJECT  │
│                              │
│                              │
│ support / controls           │
└──────────────────────────────┘
```

Primary mathematical object harus menjadi visual dominan.

---

# 9. One Screen, One Cognitive Job

Jangan menampilkan sekaligus:

- progress graph;
- streak;
- side nav;
- lesson objective panjang;
- motivational quote;
- multiple toolbars;
- reward counter;
- parent information.

Saat anak menyelesaikan aktivitas, aktivitas adalah pusat layar.

---

# 10. Typography

Gunakan typeface yang:
- sangat terbaca;
- membedakan digit dengan jelas;
- memiliki `1`, `7`, `0` yang mudah dikenali;
- mendukung Bahasa Indonesia;
- tidak terlalu dekoratif.

Ukuran angka manipulatif harus lebih besar daripada copy pendukung.

Batasi jumlah type family.

---

# 11. Color

Warna memiliki fungsi.

Contoh:
- operand/group A;
- operand/group B;
- result/group whole;
- focus;
- success;
- hint.

Namun jangan membuat anak tergantung warna saja.

Selalu kombinasikan warna dengan:
- posisi;
- bentuk;
- border;
- label;
- pattern jika perlu.

---

# 12. Surface

Tidak semua komponen harus memiliki:
- background;
- border;
- radius;
- shadow.

Gunakan whitespace sebagai struktur utama.

Card hanya saat benar-benar ada kelompok informasi yang perlu dipisahkan.

---

# 13. Radius

Hindari “everything is rounded”.

Gunakan radius konsisten, tidak berlebihan.

Math objects boleh memiliki bentuk berdasarkan objeknya, bukan mengikuti card system.

---

# 14. Iconography

Ikon:
- sederhana;
- familiar;
- berfungsi;
- tidak dekoratif.

Prioritaskan label teks untuk fungsi penting.

Contoh:
`? Petunjuk` lebih aman daripada ikon lampu abstrak tanpa label.

---

# 15. Motion

Motion hanya untuk:

- menunjukkan objek berpindah;
- menunjukkan regrouping;
- menghubungkan part → whole;
- memperlihatkan number-line jump;
- feedback state transition.

Tidak untuk:
- bouncing button;
- decorative floating;
- endless shimmer;
- attention stealing.

Hormati `prefers-reduced-motion`.

---

# 16. Success Feedback

Jangan membuat reward lebih menarik daripada matematika.

Gunakan feedback seperti:

> “Ya. 8 dan 2 membuat 10.”

lebih baik daripada:

> “AMAZING!!! +50 XP 🎉”

---

# 17. Error Feedback

Tidak:
- layar merah;
- shake kasar;
- buzzer;
- sad mascot;
- kehilangan poin.

Gunakan:

> “Belum tepat. Coba lihat kelompok yang kedua.”

---

# 18. Responsive

Prioritas:
1. tablet landscape/portrait;
2. desktop;
3. mobile.

Manipulatif harus nyaman untuk touch.

Minimum touch target yang aman perlu diuji pada perangkat nyata.

---

# 19. Accessibility

Wajib:
- semantic HTML;
- keyboard alternatives;
- visible focus;
- reduced motion;
- contrast layak;
- tidak color-only;
- text resize tidak merusak layout;
- instruction repeatable;
- ARIA hanya ketika semantic HTML tidak cukup.

---

# 20. Anti-Slop Design Test

Sebelum merge, beri skor 0/1:

- [ ] Fokus utama adalah objek matematika.
- [ ] Tidak ada dekorasi tanpa fungsi.
- [ ] Tidak terlihat seperti SaaS dashboard.
- [ ] Tidak terlihat seperti generic kids game.
- [ ] Tidak ada unnecessary gradient.
- [ ] Tidak semua konten berada dalam card.
- [ ] Tidak ada gamification noise.
- [ ] Hierarki dapat dipahami tanpa warna.
- [ ] Typography mudah dibaca anak.
- [ ] Motion memiliki tujuan pedagogik.
- [ ] Layout bekerja pada touch.
- [ ] Workspace tidak penuh.
- [ ] Feedback informatif.
- [ ] Tidak menggunakan simbol Islam klise.
- [ ] Ada visual fingerprint yang sesuai aktivitas.

Target minimum: 14/15.

Jika skor <14, redesign sebelum menambah polish.

---

# 21. Screenshot Review

Setiap halaman penting direview dari screenshot pada:

- 375px;
- 768px;
- 1024px;
- 1440px.

Review pertanyaan:

1. Apa yang pertama dilihat anak?
2. Apakah itu memang objek yang harus dipikirkan?
3. Apakah ada elemen yang “teriak” tanpa fungsi?
4. Apakah manipulatif cukup besar?
5. Apakah instruksi bisa dipahami cepat?
6. Apakah halaman terlihat generik?
7. Apakah bisa dikurangi 10–20% tanpa kehilangan makna?

Jika bisa, kurangi.
