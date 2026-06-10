# 💼 Sistem Informasi Manajemen BUMDES (Badan Usaha Milik Desa)

Sistem Informasi Manajemen BUMDES adalah aplikasi web modern berbasis **Next.js (App Router)** yang dirancang untuk mendigitalisasi, memfasilitasi, dan memantau seluruh alur operasional, administrasi, dan laporan keuangan pada Badan Usaha Milik Desa. 

Aplikasi ini mengadopsi standar akuntansi keuangan desa (Buku Kas Umum, Jurnal Umum, Buku Besar, Neraca, Laba Rugi, dan SHU) serta memiliki integrasi multi-unit usaha BUMDES secara real-time.

---

## 🚀 Fitur Utama Aplikasi

### 1. 📊 Dashboard Utama (Premium Dashboard)
* **Visual Key Metrics:** Informasi real-time mengenai Saldo Kas BUMDES, Total Simpanan Anggota, Outstanding Piutang Pinjaman, dan Pendapatan Usaha Bulan Ini.
* **Analitik Interaktif:** Visualisasi grafik perkembangan transaksi bulanan menggunakan diagram batang serta alokasi pendapatan per unit usaha menggunakan diagram donat.
* **Quick Actions:** Akses cepat ke fungsi harian penting berdasarkan hak akses pengguna.
* **Sistem Informasi Perangkat:** Status memori, database, dan informasi uptime server.

### 2. 💰 Modul Simpan Pinjam (SP)
* **Manajemen Anggota:** Pendaftaran, pemantauan status anggota (Aktif/Nonaktif), serta rekap total tabungan.
* **Simpanan Anggota:** Pencatatan simpanan Pokok, Wajib, dan Sukarela dengan pencatatan alur masuk/keluar kas secara transparan.
* **Pinjaman & Angsuran:** 
  * Formulir pengajuan pinjaman masyarakat & kelompok dengan sistem bunga flat.
  * Rekam historis angsuran (pokok + bunga) otomatis.
  * Fitur cetak kwitansi resmi transaksi simpanan/angsuran dalam bentuk pop-up struk siap cetak.

### 3. 🏢 Modul Sewa Unit Usaha
* **Sewa Gedung (GSG):**
  * Kalender penjadwalan sewa gedung serbaguna (Rapat, Badminton, Pesta).
  * Sistem DP (Down Payment) dan pelunasan pembayaran.
  * Cetak nota/kwitansi transaksi sewa.
* **Sewa Lahan & Lapak:**
  * Kontrak sewa lapak (warung/kios) tahunan maupun bulanan (Pagi/Malam).
  * Pemantauan status jatuh tempo sewa dan pembayaran iuran bulanan penyewa.

### 4. 📖 Keuangan & Buku Kas Umum (BKU)
* **Buku Kas Umum (BKU):** Pencatatan langsung alur penerimaan dan pengeluaran kas per unit usaha.
* **Pencatatan Jurnal:** Input transaksi debit/kredit yang otomatis terhubung ke Chart of Accounts (COA).
* **Buku Besar (Ledger):** Rekapitulasi mutasi saldo per akun perkiraan secara rinci.
* **Laporan Keuangan Otomatis:**
  * Laporan Neraca Saldo (Keseimbangan Aktiva & Pasiva).
  * Laporan Laba Rugi per periode (bulanan/tahunan).
  * Laporan Perhitungan Sisa Hasil Usaha (SHU) beserta persentase pembagiannya.

### 5. ✉️ Persuratan & PPOB
* **Administrasi Surat:** Buku agenda log Surat Masuk, Surat Keluar, dan Surat Keputusan (SK) beserta sistem penomoran arsip digital.
* **PPOB (Point of Payment Online Bank):** Rekapitulasi total omzet bulanan agen PPOB desa serta pencatatan komisi bersihnya langsung ke kas umum BUMDES.

### 6. ⚙️ Pengaturan, Audit & Keamanan
* **Manajemen Pengguna (CRUD):** Tambah, ubah, dan hapus akun pengguna dengan pembagian peran (Role-based Access Control).
* **Profil Mandiri:** Semua pengguna dapat mengakses halaman profil pribadi dan mengganti password secara mandiri.
* **Locking Periode Akuntansi:** Fitur penguncian transaksi keuangan pada tanggal tertentu agar laporan masa lalu tidak dapat diubah/dimanipulasi.
* **Audit Trail (Log Aktivitas):** Pencatatan otomatis setiap tindakan yang dilakukan pengguna (Login, Tambah Data, Edit, Hapus) demi transparansi.
* **Backup & Restore Database:** Ekspor instan seluruh isi database ke file JSON dan impor kembali kapan saja untuk pemulihan data.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
* **Database Client:** [Prisma ORM](https://www.prisma.io/)
* **Database Engine:** SQLite (cepat, andal, tanpa perlu setup server database terpisah)
* **Bahasa Pemrograman:** TypeScript
* **Styling:** Tailwind CSS & Vanilla CSS (modern glassmorphism UI, clean typography, dynamic states)

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

Pastikan Anda telah menginstal **Node.js** (versi 18+) dan **npm** di komputer Anda.

### Langkah 1: Clone Repository
```bash
git clone https://github.com/balongbesuk/LPJBumdes.git
cd LPJBumdes
```

### Langkah 2: Install Dependensi
```bash
npm install
```

### Langkah 3: Setup & Migrasi Database
Skema database menggunakan SQLite lokal yang disimpan di `prisma/dev.db`. Jalankan perintah migrasi berikut untuk membuat file database dan tabel-tabelnya:
```bash
npx prisma migrate dev --name init
```

### Langkah 4: Isi Data Bawaan (Seeding)
Proyek ini dilengkapi dengan skrip data bawaan awal (akun default, bagan perkiraan, saldo awal tahun anggaran, dan data transaksi simulasi lengkap). Jalankan perintah berikut untuk mengisinya:
```bash
npx prisma db seed
```

### Langkah 5: Jalankan Mode Pengembangan
```bash
npm run dev
```
Buka browser dan akses halaman aplikasi di: **`http://localhost:3000`**

---

## 🔑 Akun Pengguna Bawaan (Default Users)

Setelah menjalankan perintah `prisma db seed`, Anda dapat masuk menggunakan salah satu akun berikut sesuai dengan kebutuhan simulasi peran:

| No | Peran (Role) | Username | Password | Otoritas / Akses |
|----|--------------|----------|----------|-------------------|
| 1  | **Admin** (Kepala BUMDES) | `admin` | `admin123` | Akses penuh, manajemen user, log audit, backup/restore, kunci periode akuntansi. |
| 2  | **Bendahara Keuangan** | `bendahara` | `bendahara123` | Akses penuh modul keuangan, buku kas, jurnal, neraca, dan laporan laba rugi. |
| 3  | **Sekretaris BUMDES** | `sekretaris` | `sekretaris123` | Akses penuh modul persuratan, notulensi rapat, dan posting artikel web. |
| 4  | **Operator Simpan Pinjam** | `operator_sp` | `sp123` | Manajemen anggota, simpanan pokok/wajib/sukarela, pencairan pinjaman, angsuran, cetak kwitansi. |
| 5  | **Operator Sewa** | `operator_sewa` | `sewa123` | Manajemen sewa gedung GSG, kalender sewa, sewa lahan & lapak PKL. |

*Catatan: Setiap user di atas dapat mengganti password mereka masing-masing melalui menu **Profil Saya** di sidebar setelah masuk.*

---

## ⚙️ Perintah CLI Prisma yang Berguna

* **Membuka GUI Database (Prisma Studio):**
  Untuk melihat, mencari, dan mengedit data secara visual melalui antarmuka web, jalankan:
  ```bash
  npx prisma studio
  ```
* **Memformat Skema Prisma:**
  ```bash
  npx prisma format
  ```

---

## 🏗️ Build untuk Produksi

Untuk membuild aplikasi agar siap dideploy ke server produksi (VPS / Hosting):

1. **Jalankan Build:**
   ```bash
   npm run build
   ```
2. **Jalankan Server Produksi:**
   ```bash
   npm run start
   ```

---

## 📂 Struktur Direktori Proyek

```text
├── prisma/
│   ├── migrations/       # Riwayat perubahan database
│   ├── schema.prisma     # Definisi skema tabel database (SQLite)
│   ├── seed.ts           # Skrip pengisi data bawaan awal
│   └── seed_members.json # Data anggota simpan pinjam default
├── src/
│   ├── app/
│   │   ├── (dashboard)/  # Routing utama halaman dashboard (Layout, Keuangan, Sewa, dll.)
│   │   ├── api/          # REST API Endpoints backend
│   │   ├── login/        # Halaman autentikasi masuk
│   │   └── globals.css   # Kustomisasi CSS global & tema warna
│   ├── components/       # Komponen UI reusable (KwitansiModal, WaNotification, dll.)
│   ├── lib/              # Fungsi utilitas (Ledger, Audit Trail, database client, dll.)
│   └── middleware.ts     # Middleware untuk proteksi halaman dan otorisasi role
├── package.json          # Definisi dependensi & skrip proyek
└── tailwind.config.js    # Konfigurasi Tailwind CSS
```

---
Dibuat dengan ❤️ untuk kemajuan tata kelola Badan Usaha Milik Desa **Balongbesuk**.
