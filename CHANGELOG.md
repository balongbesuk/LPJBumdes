# Changelog

All notable changes to this project will be documented in this file.

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
