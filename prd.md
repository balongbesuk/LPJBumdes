# Product Requirement Document (PRD) & Handover Notes
## Proyek: Sistem Informasi Manajemen BUMDES & LPJ Otomatis - BUMDES "Barokah" Balongbesuk

Dokumen ini berfungsi sebagai panduan kebutuhan proyek (PRD) sekaligus catatan serah terima (*handover*) agar AI lain dapat melanjutkan pengembangan sistem ini tanpa kehilangan konteks.

---

## 1. Ringkasan Proyek
Sistem ini adalah aplikasi tata kelola internal untuk **BUMDES "Barokah" Balongbesuk** (Kecamatan Diwek, Kabupaten Jombang) yang bertujuan mengotomasi pencatatan transaksi harian dan penyusunan Laporan Pertanggungjawaban (LPJ) keuangan desa secara digital.

*   **Stack Teknologi**:
    *   **Frontend & Backend**: Next.js v14/v15 (App Router, React)
    *   **Styling**: Tailwind CSS v3 (untuk kompatibilitas penuh dengan shadcn/ui)
    *   **Komponen UI**: shadcn/ui (Radix UI)
    *   **Database**: SQLite (agar data lokal berupa file `.db` mudah dipindahkan/di-backup)
    *   **ORM**: Prisma ORM
*   **Model Akses**: Berjalan secara lokal (**localhost / offline**) di komputer kantor BUMDES, tetapi dirancang siap-online (*cloud-ready*).

---

## 2. Struktur Peran Pengguna (User Roles)
Sistem memiliki 4 peran dengan pembatasan hak akses via Next.js Middleware:
1.  **ADMIN (Kepala BUMDES)**: Hak akses penuh ke semua laporan, persetujuan pinjaman besar, grafik performa, dan pengaturan SHU.
2.  **BENDAHARA (Keuangan)**: Hak pencatatan jurnal umum, verifikasi transaksi kas dari unit-unit usaha, rekap keuangan PPOB, dan pencetakan LPJ (Neraca & Laba Rugi).
3.  **SEKRETARIS**: Mengelola administrasi persuratan (surat masuk/keluar, berkas SK) dan mengelola artikel/kegiatan BUMDES untuk di-publish ke website publik.
4.  **OPERATOR UNIT**: 
    *   *Operator Sewa*: Hanya mengelola booking gedung (badminton/acara) & kontrak lahan (warung/lapak).
    *   *Operator Simpan Pinjam*: Hanya mengelola data anggota, simpanan, dan pengajuan pinjaman.

---

## 3. Detail Kebutuhan Fungsional Unit Usaha

### Unit 1: Simpan Pinjam
*   **Aturan Simpanan**:
    *   **Simpanan Pokok**: Rp50.000 per anggota (dibayar sekali saat pendaftaran).
    *   **Simpanan Wajib**: Dibayar berkala oleh anggota (misal: bulanan Rp30.000).
    *   *Catatan Akuntansi*: Simpanan Pokok dan Wajib dicatat sebagai **Liabilitas / Hutang BUMDES** (Hutang Tabungan Masyarakat), bukan piutang.
*   **Aturan Pinjaman**:
    *   Terbagi menjadi **Pinjaman Masyarakat** dan **Pinjaman POKTAN (Kelompok Tani)**.
    *   Mencatat pencairan pinjaman, tenor, suku bunga flat, dan cicilan bulanan.
    *   *Catatan Akuntansi*: Pinjaman dicatat sebagai **Piutang** (Aset Lancar BUMDES). Bunga pinjaman dicatat sebagai **Pendapatan Jasa**.

### Unit 2: Sewa Gedung (Multi-purpose Hall / GSG)
*   **Kategori Sewa**:
    *   *Badminton*: Sewa per jam (lapangan 1, 2, dll.).
    *   *Rapat / Pesta*: Sewa harian (memblokir tanggal penuh).
*   **Kalender Booking**: Kalender interaktif visual untuk mencegah *double booking*.
*   **Status Pembayaran**: Rincian Uang Muka (DP), sisa pelunasan, dan status lunas.

### Unit 3: Sewa Lahan Warung (Tahunan)
*   Kontrak sewa lahan untuk warung permanen dengan pembayaran tahunan.
*   Dashboard harus menampilkan **Notifikasi Masa Aktif Kontrak** yang akan habis (misal: H-30).

### Unit 4: Sewa Lahan Lapak (Bulanan - Pagi & Malam)
*   Sewa lahan untuk pedagang kaki lima/lapak non-permanen dengan tarif bulanan.
*   Terbagi menjadi **Lapak Pagi** dan **Lapak Malam** pada kavling yang sama.

### Unit 5: Rekap PPOB (Payment Point Online Bank)
*   Menggunakan aplikasi bawaan dari pihak ketiga (tidak memproses transaksi pulsa/token langsung).
*   Menyediakan form input **Rekap Laba Bulanan** (total omset & komisi bersih) agar tercatat ke kas umum BUMDES.

---

## 4. Modul Keuangan & LPJ Otomatis (Standar SAK EMKM / PP 11/2021)
Sistem harus mampu mengotomasi penyusunan laporan keuangan berikut:
1.  **Laporan Posisi Keuangan (Neraca)**: Aset vs Kewajiban & Ekuitas.
2.  **Laporan Laba/Rugi**:
    *   Rincian pendapatan per unit usaha (Simpan Pinjam, Sewa Gedung, Sewa Lahan, PPOB).
    *   Rincian beban operasional pengurus & biaya unit usaha.
    *   Laba/Rugi bersih konsolidasi.
3.  **Laporan Perubahan Ekuitas**.
4.  **Laporan Arus Kas (Cash Flow)**.
5.  **Perhitungan SHU Otomatis (Customizable via Settings)**:
    *   *Default awal*: 30% Pengurus, 10% Pengawas, 10% Sosial/Pendidikan, 25% Modal, 25% Kas Desa (PADes).
6.  **Ekspor LPJ**: Tombol unduh laporan ke PDF/Excel yang rapi dan terformat.

---

## 5. Sumber Data Awal & Seeding Database
Semua file laporan historis tahun 2025 tersimpan di folder:
📂 `f:\Projek Vibe Koding\bumdes\SPJ BUMDES INTI 2025\`

> [!WARNING]
> **Potensi Kesalahan Hitung pada PDF Historis**: Berkas laporan 2025 dalam folder `SPJ BUMDES INTI 2025` memiliki kemungkinan kesalahan perhitungan (*miscalculation*). Selama proses migrasi data awal (seeding) maupun pembuatan rumus transaksi, pengembang/AI harus tetap teliti dan memastikan logika matematika & akuntansi berjalan dengan benar (seperti `Saldo Akhir = Saldo Awal + Masuk - Keluar`) serta berpegang teguh pada aturan LPJ Baku Terbaru, bukan memaksakan kecocokan angka jika terdapat kesalahan hitung pada laporan fisik lama.

Daftar file utama untuk referensi pengembangan:
*   [simpan pinjam.pdf](file:///f:/Projek Vibe Koding/bumdes/SPJ BUMDES INTI 2025/simpan pinjam.pdf): Berisi daftar anggota riil, saldo awal simpanan pokok (P-001 s.d P-065), dan wajib (S-001 s.d S-065). **Harus diparsing menggunakan Python untuk seeding database**.
*   [neraca 05_compressed.pdf](file:///f:/Projek Vibe Koding/bumdes/SPJ BUMDES INTI 2025/neraca 05_compressed.pdf): Saldo awal akun keuangan BUMDES per 1 Januari 2026.
*   [rugi laba  2025.pdf](file:///f:/Projek Vibe Koding/bumdes/SPJ BUMDES INTI 2025/rugi laba  2025.pdf): Laba/Rugi tahunan 2025 sebagai acuan struktur akun biaya dan unit usaha.
*   [buku harian bumdes 2025.pdf](file:///f:/Projek Vibe Koding/bumdes/SPJ BUMDES INTI 2025/buku harian bumdes 2025.pdf): Contoh pencatatan kas harian.

---

## 6. Progres dan Hasil Akhir (100% Selesai)

Semua langkah kerja utama telah diselesaikan dan diuji dengan sukses:

1.  **Inisialisasi Project (SELESAI)**:
    *   Proyek Next.js dengan Tailwind CSS v3 aktif di direktori utama.
    *   Konfigurasi Prisma ORM dengan SQLite (`prisma/schema.prisma`) berjalan dengan baik.
2.  **Pembuatan Parser & Seeding (SELESAI)**:
    *   Skrip parser Python di `scripts/parse_sp.py` telah mengekstrak data dari [simpan pinjam.pdf](file:///f:/Projek Vibe Koding/bumdes/SPJ BUMDES INTI 2025/simpan pinjam.pdf).
    *   Data diimpor dengan skrip `prisma/seed.ts` ke SQLite database dengan keseimbangan saldo awal Rp412.924.331,00.
3.  **Desain Antarmuka (SELESAI)**:
    *   Menggunakan komponen modern `shadcn/ui` dengan skema warna Emerald Green premium dan tata letak sidebar yang responsif.
4.  **Implementasi Fitur & API (SELESAI)**:
    *   Seluruh modul aktif: Simpan Pinjam (Simpanan & Kredit), Kalender Booking Sewa Gedung, Tab Kontrak Sewa Lahan (Warung & Lapak), Rekap Laba PPOB Bulanan, Log Surat Masuk/Keluar, dan CMS Artikel Berita.
5.  **Perhitungan Akuntansi (SELESAI)**:
    *   Posting jurnal ganda otomatis (double-entry ledger) dari transaksi harian ke Buku Besar berjalan dinamis.
    *   Laporan Neraca SAK EMKM, Laba/Rugi, pembagian SHU, dan penyesuaian saldo terintegrasi penuh.
6.  **Uji Coba & Keamanan (SELESAI)**:
    *   Otentikasi multi-role dan keamanan rute Next.js Middleware (`src/middleware.ts`) membatasi hak akses berdasarkan peran pengguna (Admin, Bendahara, Sekretaris, Operator Unit).
    *   Pencetakan laporan ramah-cetak (print-friendly) di halaman `/keuangan` bekerja dengan baik untuk ekspor dokumen pertanggungjawaban fisik.
    *   Uji coba fungsionalitas dan keamanan rute telah divalidasi 100% sukses menggunakan browser automation.

