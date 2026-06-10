# Kebijakan Keamanan (Security Policy)

Kami berkomitmen untuk menjaga keamanan data BUMDES dan seluruh modul di dalam aplikasi ini. Halaman ini menjelaskan versi perangkat lunak yang didukung, cara melaporkan kerentanan keamanan, serta panduan pengamanan tambahan saat deploy aplikasi.

## Versi yang Didukung (Supported Versions)

Pembaruan keamanan dan perbaikan bug aktif saat ini hanya dirilis untuk versi mayor terbaru:

| Versi | Didukung secara Aktif |
| ------- | --------------------- |
| 1.3.x   | :white_check_mark: Ya |
| < 1.3.0 | :x: Tidak             |

---

## Melaporkan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan kerentanan keamanan atau kelemahan sistem dalam aplikasi ini, harap **jangan memublikasikannya secara terbuka** melalui GitHub Issues atau forum publik lainnya. 

Ikuti langkah-langkah berikut untuk melaporkan masalah secara aman:

1. Kirim laporan detail melalui surel (email) pengembang atau administrator teknis BUMDES setempat di: **admin@desa.id** atau **keamanan@bumdes.go.id**.
2. Berikan rincian kerentanan, langkah-langkah reproduksi (PoC), beserta dampak yang mungkin ditimbulkan terhadap data keuangan atau sistem BUMDES.
3. Tim kami akan merespons laporan Anda dalam waktu **48 jam** dan mendiskusikan langkah penyelesaian serta estimasi perilisannya.

Kami sangat menghargai kontribusi Anda dalam menjaga keamanan data desa melalui metode pengungkapan yang bertanggung jawab (*responsible disclosure*).

---

## Praktik Keamanan Terbaik Saat Deploy (Best Security Practices)

Saat melakukan instalasi dan penggunaan aplikasi di lingkungan produksi, administrator wajib menerapkan beberapa lapisan proteksi tambahan berikut:

### 1. Kunci Rahasia JWT (`JWT_SECRET`)
Pastikan variabel lingkungan `JWT_SECRET` diubah di dalam berkas `.env.local` di server produksi. **Jangan gunakan kunci bawaan (*default fallback*)**:
```env
JWT_SECRET=gunakan_string_acak_panjang_dan_rumit_untuk_produksi
```

### 2. HTTPS/SSL
Semua komunikasi data finansial BUMDES wajib dienkripsi. Gunakan sertifikat SSL (misalnya dari Let's Encrypt) dan paksa koneksi menggunakan protokol `HTTPS` untuk mengamankan cookie `bumdes_token` yang disetel dengan bendera `httpOnly`.

### 3. Batasi Akses Berkas Database SQLite
Berkas SQLite `prisma/dev.db` disimpan di sistem lokal server. Pastikan hak akses berkas (file permissions) dibatasi sehingga hanya pengguna sistem yang menjalankan proses Node.js / Next.js saja yang dapat membaca dan menulis berkas tersebut:
```bash
chmod 600 prisma/dev.db
```

### 4. Backup Berkala
Gunakan menu **Pengaturan > Pencadangan & Pemulihan** secara periodik untuk mengunduh cadangan database `.db`. Simpan cadangan database di media penyimpanan eksternal yang aman dan terpisah dari server utama.
