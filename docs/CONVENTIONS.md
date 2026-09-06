# Code conventions

Per-workspace patterns for humans and AI. **Last reviewed:** 2026-09-06.

## Monorepo

| Item                 | Convention                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package names        | `@platform/storefront`, `@platform/admin`, `@platform/server`, `@platform/shared`, `@platform/site-config`, `@platform/api-client`, `@platform/react-busy` |
| Folder vs name       | Folder `client/` = npm `@platform/storefront`; folder `admin/` = `@platform/admin`                                                                         |
| Node                 | **20.x** at repo root (`engines` in root `package.json`)                                                                                                   |
| Imports (server ESM) | Use `.js` extensions in `server/src` relative imports                                                                                                      |
| Site IDs             | kebab-case (`beauty-station`)                                                                                                                              |

Run root scripts from repo root. Workspace dev commands auto-run `api:ensure` + `build:packages` via `predev`.

## Multi-site

```ts
import { getSiteConfig } from "@platform/site-config";

const site = getSiteConfig(process.env.SITE_ID);
```

**Workspace helpers:**

| Helper                      | File                 | Env overrides                                             |
| --------------------------- | -------------------- | --------------------------------------------------------- |
| `getStorefrontSiteConfig()` | `client/lib/site.ts` | `NEXT_PUBLIC_SITE_URL`, `API_URL` / `NEXT_PUBLIC_API_URL` |
| `getAdminSiteConfig()`      | `admin/lib/site.ts`  | None (uses config as-is)                                  |

| Env var                                             | Where          | Purpose                                    |
| --------------------------------------------------- | -------------- | ------------------------------------------ |
| `SITE_ID`                                           | server         | Select site config + DB context            |
| `NEXT_PUBLIC_SITE_ID`                               | admin, client  | Select site config in browser              |
| `MONGODB_URI`                                       | server         | MongoDB connection (one DB per site)       |
| `API_URL` / `NEXT_PUBLIC_API_URL`                   | admin, client  | Backend base URL                           |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`           | server         | Sign access/refresh tokens                 |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`   | server         | Token lifetime (e.g. `15m`, `7d`)          |
| `NEXT_PUBLIC_ACCESS_TOKEN_MAX_AGE`                  | admin          | Cookie max-age (seconds); match access JWT |
| `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | server, client | Google OAuth (same Web client ID)          |
| `SMTP_*`, `EMAIL_FROM`                              | server         | Password reset + email verification links  |

Reference templates: `server/.env.example`, `admin/.env.example`, `client/.env.example`, and `sites/{id}/.env.example` from `npm run create-site`.

- Add new sites in `packages/site-config/src/sites/{id}.ts` and register in `index.ts`. Include `branding` (logo paths) and `features` (must match registry).
- Update `docs/site-registry.json` (all `features` flags must match the site config file).
- Run `npm run create-site` for env scaffolding.
- Do **not** hardcode site names in feature code.

**First admin:** `npm run seed:admin` (uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `server/.env`; defaults are dev-only). Re-running promotes an existing user to `admin` and resets the password.

## API contract

**Chain:** `packages/shared/src/schemas/` → `server/src/openapi/registry.ts` → `packages/api-client/openapi.json` → Orval → `packages/api-client/src/generated/`.

- Validate request bodies with Zod from `@platform/shared` in route handlers.
- Strong passwords (reset + change): `@platform/shared` `password.ts` — 8+ characters with uppercase, lowercase, number, and symbol; enforced in API schemas and admin/storefront reset forms.
- Serialize Mongo documents via DTO helpers (e.g. `toProductDto`).
- Frontends import `@platform/api-client` — use `fetchProducts` helpers or `platformApi.listProduct()`.
- **Never** hand-edit `packages/api-client/src/generated/**`.
- After contract changes: `npm run api:generate` and commit `openapi.json` + generated files.

See [ARCHITECTURE.md](ARCHITECTURE.md) § API contract and `.cursor/rules/api-contract.mdc`.

## Server (`@platform/server`)

| Pattern      | Location                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Routes       | `server/src/routes/*.routes.ts`                                                                                                                                          |
| Models       | Mongoose in `server/src/models/`                                                                                                                                         |
| Errors       | `AppError` + `middleware/errorHandler.ts`                                                                                                                                |
| Async routes | `asyncHandler` wrapper                                                                                                                                                   |
| OpenAPI      | `server/src/openapi/registry.ts`                                                                                                                                         |
| Seed         | `npm run seed` → `server/src/scripts/seed.ts` (site dataset + `productCount` on categories/brands/attributes); `npm run seed:admin` → `server/src/scripts/seed-admin.ts` |
| Format       | Prettier                                                                                                                                                                 |

## Admin (`@platform/admin`)

| Topic        | Convention                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling      | Tailwind CSS 4 — semantic tokens in `app/globals.css` (`bg-brand-600`, `text-ink-500`, …)                                                                                                                                                                                                                                                                                                               |
| Icons        | `lucide-react`                                                                                                                                                                                                                                                                                                                                                                                          |
| Navigation   | `config/routes.ts` + `config/navigation.ts`; optional `feature` keys filter nav via `lib/navigation-filter.ts`                                                                                                                                                                                                                                                                                          |
| Site         | `lib/site.ts` → `getAdminSiteConfig()`; `config/site.ts` exposes `branding`, `features`, `displayName`                                                                                                                                                                                                                                                                                                  |
| Auth UI      | `lib/brand.ts` → `createAdminMetadata()`; sign-in shell uses `siteConfig.branding`                                                                                                                                                                                                                                                                                                                      |
| API mappers  | `lib/mappers/` — map DTOs to UI types                                                                                                                                                                                                                                                                                                                                                                   |
| Lint         | Biome + Prettier (`npm run check`)                                                                                                                                                                                                                                                                                                                                                                      |
| Auth         | JWT via BFF `/api/auth/*` (httpOnly cookies + in-memory Bearer); `admin/proxy.ts` guards dashboard; sign-in requires `role: admin`; `/forgot-password` + `/reset-password` for self-service reset; `adminPath()` for subdirectory client redirects; rejecting a non-admin session must **not** clear auth cookies (storefront/admin share cookie names; on `localhost` cookies are shared across ports) |
| Phone inputs | `components/forms/phone-input.tsx` — country selector with E.164 value; default country from `SiteConfig.defaultPhoneCountry`                                                                                                                                                                                                                                                                           |

Catalog list pages fetch from API in Server Components; show inline error banner with seed hint on failure.

Production catalog CRUD forms: `admin/components/catalog/*-catalog-form.tsx` (re-exported from `catalog-forms.tsx`); shared controls in `catalog-form-primitives.tsx`. Slugs are never edited in the UI — the API derives them from names. Category thumbnails support GCS upload or external URL (mutually exclusive modes with clear).

**Async action guard:** `@platform/react-busy` — wrap each app in `BusyProvider` (admin re-exports as `CrudBusyProvider`). During create/update/delete/submit, call `useSubmitBusy(submitting)` or `useBusyActionGuard({ active })` so a viewport overlay blocks navigation and `beforeunload` warns on tab close. List deletes use `BusyShield` on table sections; modals stay above the overlay.

## Storefront (`@platform/storefront`)

| Topic              | Convention                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling            | Bootstrap 5 + SCSS (`public/assets/scss/`)                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Site theme         | `SiteThemeStyles` injects CSS variables from `site.theme`                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Site branding      | `lib/site-branding.ts` → logo/phone for `Header13` / `Footer7` on production routes                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Home layout        | `SiteConfig.homeLayout` → `HomeLayoutRenderer`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Demo catalog       | Static data in `data/products/*.ts` with optional `demoTab` for tabs                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Tab filtering      | See `client/.cursor/rules/product-tab-filtering-pattern.mdc`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Modals             | Register in `components/common/other-components/LayoutModals.tsx`; state in `context/uiStore.ts`                                                                                                                                                                                                                                                                                                                                                                                                         |
| Cart / wishlist    | Zustand + persist in `context/store.ts` (cart/compare only when server wishlist enabled); server cart API when `features.customerAuth`; server wishlist API when `customerAuth` + `wishlist` (auth gate uses session + token; pending queue in sessionStorage)                                                                                                                                                                                                                                           |
| Customer auth      | httpOnly session cookies via `/api/auth/*` route handlers; in-memory access token for `@platform/api-client`; `AuthIconButton` / `AuthAccessBox` / `AuthSignInTrigger` / `ToolbarProfileAction` in `components/auth/storefront-auth-entry.tsx` when `customerAuth`; session bootstrap skipped on `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`; `storefrontPath()` in `lib/paths.ts` for full-page redirects; production sign-in at `/signin` links to `/forgot-password` |
| Phone inputs       | `components/forms/phone-input.tsx` + `@platform/shared` phone helpers; country selector + E.164 storage; default country from `SiteConfig.defaultPhoneCountry`; checkout/address forms sync dial code when country name is recognized                                                                                                                                                                                                                                                                    |
| Profile photo      | `AccountAvatarSection` uploads via `POST /api/users/me/avatar` (JPEG/PNG/WebP/HEIC, max 5 MB; HEIC converted to WebP server-side) → GCS (`avatars/{userId}/…`); replacing or removing clears the previous managed GCS object; all GCS image uploads above 800 KB are compressed to 400–800 KB WebP; requires `GCS_*` env vars (same as admin uploads)                                                                                                                                                    |
| Google sign-in     | `@react-oauth/google` + BFF `POST /api/auth/social`; requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (must match server `GOOGLE_CLIENT_ID`)                                                                                                                                                                                                                                                                                                                                                                      |
| Email verify       | Code emailed on register when SMTP set; `POST /api/orders` requires verified email for customers; checkout blocks submit until verified                                                                                                                                                                                                                                                                                                                                                                  |
| API fallback       | Try `@platform/api-client`, fall back to static data where implemented                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Async action guard | Same `@platform/react-busy` pattern as admin — `BusyProvider` in `providers/app-providers.tsx`; `useSubmitBusy` on auth, checkout, contact, newsletter; account sections report busy via `AccountInfoGuard` + global lock                                                                                                                                                                                                                                                                                |
| Lint               | ESLint + Prettier                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

The storefront is primarily a **theme demo** (~300 routes). Wire API only for production paths the product needs.

## Tooling matrix

| Workspace                         | Lint   | Format                     |
| --------------------------------- | ------ | -------------------------- |
| Root / server / packages / client | —      | Prettier via root `format` |
| Admin                             | Biome  | Prettier                   |
| Client                            | ESLint | Prettier                   |

**CI today:** `api:check`, `build:packages`, `typecheck` — no Next.js build or lint in CI yet.

## Scripts (root)

| Script           | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `create-site`    | Scaffold `sites/{id}/` from template                                 |
| `rebrand-client` | Client rebranding helper (`npm run rebrand -w @platform/storefront`) |

## Documentation sync

When you change contracts, routes, site config, or these conventions, update docs in the same change. See `.cursor/rules/documentation-sync.mdc`.
