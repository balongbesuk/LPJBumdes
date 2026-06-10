# Changelog

All notable changes to this project will be documented in this file.

## [1.3.1] - 2026-06-10

### Fixed
- **Security Hardening (Code Scanning & Dependabot fixes)**:
  - Removed the hardcoded fallback JWT secret in `src/lib/jwt.ts` and replaced it with a dynamically generated fallback key using standard global `crypto.getRandomValues()` to resolve hardcoded cryptographic credential scanner warnings.
  - Hardened cookie configurations for the legacy `bumdes_user` session cookie by adding `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, and explicit `httpOnly` flags to set and delete operations in authentication and reset API routes.
  - Resolved the PostCSS vulnerability (XSS via Unescaped `</style>` tag) by upgrading `postcss` in devDependencies to `^8.5.10` and setting a package-wide override in `package.json` to force all Next.js sub-dependencies to use a secure PostCSS version.

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
