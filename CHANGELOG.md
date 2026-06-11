# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-06-11

### Added
- **Cadangan Kerugian Penurunan Nilai (CKPN) Simpan Pinjam**:
  - Ditambahkan endpoint `/api/simpan-pinjam/ckpn` untuk hitung cadangan piutang (Lancar 0.5%, Terlambat/Macet 50%) dan memposting jurnal penyesuaian.
  - Ditambahkan komponen antarmuka modal `CkpnModal.tsx` di frontend.
  - Otomatis mendaftarkan akun ledger `1-1450` (Penyisihan Piutang) dan `5-1600` (Beban Kerugian Piutang) jika belum ada.
- **Otomatisasi Jurnal Penutupan Akhir Tahun (Annual Closing)**:
  - Ditambahkan endpoint `/api/keuangan/closing` untuk melakukan Tutup Buku Tahunan (reset akun Pendapatan/Beban ke 0, transfer laba bersih berjalan ke Laba Ditahan `3-1200` pada 31 Desember, serta kunci periode otomatis).
  - Terintegrasi antarmuka eksekusi Tutup Buku Tahunan pada `TutupBukuTab.tsx`.

### Fixed
- **Integrasi Pajak Neraca**:
  - Memperbaiki ketidakseimbangan Laporan Neraca dengan memasukkan akun `2-1400` (Hutang Pajak) ke dalam kalkulasi total liabilitas dan total pasiva.

## [1.4.0] - 2026-06-10

### Changed
- **Next.js 15 & React 19 Upgrade**:
  - Upgraded Next.js from `14.2.35` to `15.5.18` and migrated React to `19.0.0` (resolves 14 Next.js Dependabot alerts).
  - Refactored all Route Handlers and Server Components to await `cookies()` as it is now asynchronous.
  - Refactored dynamic routes (`berita/[slug]`, `users/[id]`, and `artikel/[id]`) to await `params` as they are now Promises.

### Fixed
- **CodeQL Security Hardening**:
  - Resolved **CodeQL High Severity Alert**: Removed the legacy SHA-256 password hashing fallback to keep only modern `bcrypt` password verification, eliminating weak cryptographical algorithm warnings.
  - Resolved **CodeQL High Severity Alert**: Rewrote the combined alternation ReDoS regular expression in `slugify` inside `src/lib/utils.ts` into two separate, safe replacements (avoids polynomial regex backtracking risk).
  - Resolved **CodeQL Moderate Alert**: Sanitized and hardened cookie configurations by setting `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, and `httpOnly` flags for the legacy session cookie.
  - Resolved **PostCSS Vulnerability**: Forced PostCSS to version `^8.5.10` or higher across all dependencies using npm `overrides`.

## [1.3.0] - 2026-06-10

### Added
- **Reset Database Feature**:
  - Added a "Reset Database (Mulai Baru)" card and button in the Backup & Recovery tab under Settings (`/pengaturan`).
  - Added a double-confirmation modal requiring the user to type `"RESET"` before initiating database reset.
  - Wipes all transactional data, fixed assets, members, audit logs, and period locks while preserving administrative logins.
  - Automatically clears JWT (`bumdes_token`) and user session (`bumdes_user`) cookies on reset.
  - Configured login page (`/login`) to automatically redirect to the setup wizard (`/setup`) if the database settings are in a fresh/empty state.

## [1.2.0] - 2026-06-10

### Added
- **Multi-Desa & Setup Wizard**:
  - Added interactive `/setup` configuration wizard for first-time installation (village profile, custom SHU allocation, and initial balance entry).
  - Implemented automatic opening ledger journal entry creation from setup wizard initial balance inputs.
  - Added whitelist configurations for `/setup` and `/api/setup` in `middleware.ts`.
  - Added global client-side `SettingsProvider` and `useSettings` hook, and server-side `getSettings` helper.

### Changed
- **Generic Seeding & Dynamic UI**:
  - Cleaned up database default seed data (`prisma/seed.ts`) to be completely generic.
  - Refactored hardcoded village/BUMDES details across landing page, layouts, login, dashboard stats, Simpan Pinjam, Sewa Lahan, Sewa Gedung, PPOB, Keuangan, receipts, PDF print layouts, and WhatsApp reminder templates to be dynamic based on database settings.
  - Removed hardcoded 2025 historical financial statistics and offsets from dashboard metrics and PPOB listings.

## [1.1.0] - 2026-06-10

### Added
- **Public Frontend Website**:
  - Landing page (`/`) showcasing BUMDES Barokah info, statistics, and business units.
  - Searchable news listing page (`/berita`) with interactive search bar filtering.
  - News detail page (`/berita/[slug]`) with full article view and other recent news recommendations.
- **SEO Optimization**:
  - Global navbar/footer templates.
  - Robots directory file (`robots.txt` / `src/app/robots.ts`) directing crawler bots.
  - Static and dynamic OpenGraph metadata configured for sharing previews.
- **Clean Sluggish URLs**:
  - Added unique `slug` field to `Post` model in database schema (`prisma/schema.prisma`).
  - Added auto-slugify hooks to API creating (`POST` `/api/artikel`) and updating (`PUT` `/api/artikel/[id]`) routes.

### Changed
- **Dashboard Relocation**:
  - Private dashboard relocated from `/` to `/dashboard`.
  - Updated authentication check redirects in `middleware.ts` and `/login` page to redirect to `/dashboard`.
  - Updated dashboard sidebar layout navigation settings to point to `/dashboard`.
- **Utility Improvements**:
  - Added text-to-slug parser function (`slugify`) to `src/lib/utils.ts`.
