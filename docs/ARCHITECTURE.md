# Ecommerce Platform Architecture

Multipurpose ecommerce monorepo: one codebase, many site deployments.

**Last reviewed:** 2026-09-05. See [AI-INDEX.md](AI-INDEX.md) for the full doc map and tree.

## Layout

```
ecommerce-platform/
├── client/                 # Storefront — npm @platform/storefront (Next.js)
├── admin/                  # Admin dashboard — npm @platform/admin (Next.js)
├── server/                 # API — npm @platform/server (Express + MongoDB)
├── packages/
│   ├── shared/             # Types + Zod schemas (validation + OpenAPI source)
│   ├── api-client/         # OpenAPI artifact, Orval config, generated client
│   └── site-config/        # Site registry + getSiteConfig()
├── sites/
│   ├── beauty-station/     # Site env examples + README
│   └── _templates/         # Env templates for create-site CLI
├── scripts/                # create-site CLI, rebrand-client helper
└── docs/                   # Architecture, routes, conventions, site registry
```

## Platform vs site

| Layer           | Location                                  | Per new website?        |
| --------------- | ----------------------------------------- | ----------------------- |
| Platform code   | `client`, `admin`, `server`, `packages/*` | No — redeploy same code |
| Site config     | `packages/site-config/src/sites/{id}.ts`  | Yes — add config file   |
| Site assets/env | `sites/{id}/.env.example`                 | Yes                     |
| Data            | MongoDB database per site                 | Yes                     |
| Media           | GCS bucket per site                       | Yes                     |

## Integration maturity

The platform skeleton is real (shared contract, multi-site config, catalog + commerce API). UI is largely a purchased theme with production routes wired for Beauty Station:

| Layer  | API-connected                                                                                                                                                                        | Template / static                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Server | Catalog CRUD + auth + cart/orders/wishlist + uploads + user addresses; slug lookup; referential delete guards (category/brand/attribute); rename propagation; attribute usage counts | No payment gateway; coupons/reviews/blog APIs                              |
| Admin  | Catalog CRUD + sign-in + orders list/detail; rich catalog forms; product attribute picker; nav filtered by `SiteConfig.features`                                                     | Dashboard, customers, coupons, reviews, settings, reports (~30 demo pages) |
| Client | Home layout + `/shop` + `/product/[slug]` (slug API) + customer auth + checkout + wishlist (`/my-wishlist`)                                                                          | 300+ demo routes; demo catalog items stay local-only in cart               |

**Auth:** JWT on catalog mutations and uploads. Admin and storefront use **httpOnly cookies** (via each app’s `/api/auth/*` routes) for refresh/access tokens; short-lived access tokens are also held in memory for API calls. Logout, password change, and account deletion revoke refresh tokens (`refreshTokenVersion`). Password reset and **email verification on register** email magic links via SMTP when `SMTP_HOST` is set; without SMTP, dev returns/logs link tokens. **Customers must verify email before `POST /api/orders`.** Storefront Google sign-in (`POST /api/auth/social`) verifies ID tokens when `GOOGLE_CLIENT_ID` is set and can import Google profile photos. OAuth-only users confirm delete/set-password with a Google `idToken`. Customer account deletion is a soft delete with a 14-day reactivation window on login. Auth routes are rate-limited. Production rejects default JWT secrets.

## Beauty Station (site #1)

- **Home layout:** `cosmetic-beauty-two` (not `home-cosmetic-beauty`)
- **Site ID:** `beauty-station`
- **Database:** `beauty-station`
- **Registry:** [site-registry.json](site-registry.json)

## Environment variables

Each app reads:

- `SITE_ID` / `NEXT_PUBLIC_SITE_ID` — selects site config (default `beauty-station`)
- `MONGODB_URI` — server only, one DB per site
- `API_URL` / `NEXT_PUBLIC_API_URL` — admin + client → server
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — server only, password-reset email (optional in dev)

Copy `.env.example` from each app and `sites/beauty-station/.env.example` for a full local setup.

## Local development

```bash
# From repo root
npm install
npm run build:packages
npm run dev:server   # :5000 — Swagger UI at /api/docs
npm run seed         # seed beauty-station DB
npm run dev:admin    # :3001
npm run dev:client   # :3000
```

| App        | URL                   |
| ---------- | --------------------- |
| Storefront | http://localhost:3000 |
| Admin      | http://localhost:3001 |
| API        | http://localhost:5000 |

## Adding a new site

```bash
npm run create-site sport-shop -- --template sport
```

Then:

1. Add config in `packages/site-config/src/sites/sport-shop.ts`
2. Register in `packages/site-config/src/index.ts`
3. Add entry to `docs/site-registry.json`
4. Create MongoDB + GCS + deploy with new env vars

## API contract (OpenAPI + Orval)

The API is documented with **OpenAPI 3** and consumed by frontends through a generated **Orval** client.

### Source of truth

| Layer            | Location                                                | Role                                         |
| ---------------- | ------------------------------------------------------- | -------------------------------------------- |
| Zod schemas      | `packages/shared/src/schemas/`                          | Request validation + DTO shapes              |
| OpenAPI registry | `server/src/openapi/registry.ts`                        | Path/response definitions                    |
| OpenAPI spec     | `packages/api-client/openapi.json`                      | Committed contract artifact                  |
| Orval config     | `packages/api-client/orval.config.ts`                   | OpenAPI → typed axios client (`tags-split`)  |
| Generated types  | `packages/api-client/src/generated/platform.schemas.ts` | Shared DTO + param types                     |
| Generated tags   | `packages/api-client/src/generated/{tag}/`              | One module per OpenAPI tag                   |
| Generated barrel | `packages/api-client/src/generated/index.ts`            | `platformApi` + schema re-exports            |
| Axios mutator    | `packages/api-client/src/mutator.ts`                    | `customInstance` + error handling            |
| Hand-written API | `packages/api-client/src/helpers.ts`                    | Convenience wrappers (`fetchProducts`, etc.) |

### Live docs (dev server)

| URL                                      | Description      |
| ---------------------------------------- | ---------------- |
| `http://localhost:5000/api/docs`         | Swagger UI       |
| `http://localhost:5000/api/openapi.json` | Raw OpenAPI JSON |

### Commands

Root scripts delegate to `@platform/api-client` (see `packages/api-client/package.json`).

```bash
# Regenerate spec + client after API changes (Orval + Prettier)
npm run api:generate

# Same pipeline, from the api-client package directly
npm run generate -w @platform/api-client

# Auto-regenerate when contract inputs change (used by dev:server/admin/client)
npm run api:ensure

# Watch contract inputs and regenerate on save (optional, for API-heavy work)
npm run api:watch

# Format only API contract artifacts
npm run api:format

# Verify committed artifacts match the registry (used in CI)
npm run api:check

# OpenAPI spec only (no Orval)
npm run openapi:generate

# Build shared, site-config, and api-client
npm run build:packages
```

### Changing the API

1. Update Zod schemas in `@platform/shared` (request + DTO schemas).
2. Register or update paths in `server/src/openapi/registry.ts`.
3. Implement route handlers in `server/src/routes/`.
4. Run `npm run api:generate` (or restart any dev app — `api:ensure` runs automatically).
5. Commit `openapi.json` and `packages/api-client/src/generated/`.
6. Use the new functions from `@platform/api-client` in `admin` / `client`.
7. Update [ROUTES.md](ROUTES.md).

### Orval output

Orval `axios` + `tags-split`, then `scripts/generate-orval-barrel.mjs` composes tag factories into `platformApi`. Full pipeline in `packages/api-client/scripts/generate.ts`:

1. Build `@platform/shared`
2. Emit `openapi.json` from the server registry
3. Run Orval (`orval.config.ts` — `tags-split` into `src/generated/{tag}/`)
4. Run `generate-orval-barrel.mjs` → `src/generated/index.ts` (`platformApi`, `getPlatformAPI`)
5. Prettier + `tsc`

**Safety net:** `dev:server`, `dev:admin`, and `dev:client` call `api:ensure` first. If `packages/shared` or `server/src/openapi` changed since the last generation, it runs `api:generate` automatically. Set `SKIP_API_GENERATE=1` to only warn. Use `api:watch` while actively editing the API.

Import from `@platform/api-client`:

```ts
import {
  fetchProducts,
  platformApi,
  type ListProductParams,
} from "@platform/api-client";

const page = await fetchProducts({ status: "published", limit: 20 });
const products = await platformApi.listProduct({ status: "published" });
```

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR:

1. `npm run api:check` — fails if the OpenAPI spec or generated client is stale
2. `npm run build:packages`
3. `npm run typecheck` — full monorepo type check
4. `npm run test:ci` — API integration tests against MongoDB 7 (`MONGODB_URI_TEST`)

CI does **not** run Next.js builds or workspace lint yet.

### API integration tests

Location: `server/test/` (`health`, `auth`, `catalog`, `commerce`, `uploads` suites). Run from repo root:

```bash
npm run test
```

Requires MongoDB on `127.0.0.1:27017` (default DB `ecommerce-platform-test`). Override with `MONGODB_URI_TEST`. Tests drop the test database on each suite setup — never point this at production data.

## API (catalog)

See [ROUTES.md](ROUTES.md) for the full table. Summary:

- `GET/POST /api/products`, `GET /api/products/slug/:slug`, `GET/PATCH/DELETE /api/products/:id` (PATCH validates category/brand FKs and attribute keys/values; maintains `productCount`; **slug is immutable after create**; deleting a product removes managed GCS images)
- `GET/POST /api/categories`, `GET/PATCH/DELETE /api/categories/:id` (delete **409** when products reference it; rename propagates `categoryName`; slug server-derived from name; deleting or replacing a category image removes the old managed GCS object)
- `GET/POST /api/brands`, `GET/PATCH/DELETE /api/brands/:id` (delete **409** when products reference it; rename propagates `brandName`; slug server-derived)
- `GET/POST /api/attributes`, `GET/PATCH/DELETE /api/attributes/:id` (delete **409** when products use attribute slug; rename re-slugs and migrates product keys; **409** when removing attribute values still used by products; `productCount` maintained on product CRUD)
- `POST /api/uploads`, `DELETE /api/uploads` (managed catalog folders only)
- `GET /api/cart` refreshes line snapshots and prunes unavailable products; guest cart merge runs on login/registration and when an authenticated session is restored (`POST /api/cart/merge`); guest cart rows are deleted after merge
- `GET /api/health`

Catalog **GET** routes are public. Catalog **POST/PATCH/DELETE** and **uploads** require admin JWT (`bearerAuth` in OpenAPI).

## Database

- **MongoDB** via Mongoose 9 — one database per site (`MONGODB_URI`)
- Models: `Product`, `Category`, `Brand`, `Attribute` in `server/src/models/`
- Seed: `npm run seed` → `server/src/scripts/seed.ts` (dataset from `SITE_ID` + `homeLayout`: beauty, sport, or general). Sets `productCount` on categories, brands, and attributes from seeded product links.
- Optional media: Google Cloud Storage (`POST /api/uploads` returns 503 if not configured; `DELETE /api/uploads` removes managed catalog images). Server deletes managed GCS objects when products/categories are deleted or when image fields change on PATCH. Image uploads above **800 KB** are automatically re-encoded to WebP between **400 KB and 800 KB** before storage (applies to all GCS uploads, including profile photos).

## Feature flags

Site-specific modules are defined in site config (`features.*`). Admin navigation filters optional modules (`attributes`, `brands`, `coupons`, `reviews`) when the matching feature is `false`. Storefront module gating is not implemented yet.

## Storefront notes

- Large theme demo: 80+ home layouts, many shop/product variants under `client/app/`.
- `HomeLayoutRenderer` maps each `HomeLayoutId` to a dedicated layout under `client/components/site/home-layouts/`.
- Production chrome on `/shop` and `/product/[slug]` uses `SiteConfig.branding` + `contact` in `Header13` / `Footer7`.
- Cart, wishlist, compare: Zustand in `client/context/store.ts`. Cart and compare persist in localStorage; when `features.customerAuth` + `features.wishlist` are enabled, wishlist syncs to `/api/wishlist` (server is source of truth; not persisted locally). See [ROUTES.md](ROUTES.md) § storefront wishlist notes.
- Tab-driven product sections: follow `client/.cursor/rules/product-tab-filtering-pattern.mdc`.

## Admin notes

- Tailwind 4 + Biome lint + Prettier.
- Optional `basePath` from `NEXT_PUBLIC_BASE_URL` in `admin/next.config.ts`.
- Catalog list + CRUD pages use `@platform/api-client`. Production forms in `components/catalog/*-catalog-form.tsx` (shared UI in `catalog-form-primitives.tsx`); slugs are server-generated. Product form includes active-attribute picker. Nav items with `feature` keys respect `SiteConfig.features`.

## Tooling

| Workspace        | Lint   | Format   |
| ---------------- | ------ | -------- |
| Admin            | Biome  | Prettier |
| Client           | ESLint | Prettier |
| Server, packages | —      | Prettier |

## Extensibility

- **Extra product fields:** use Attributes (DB-driven) or `product.metadata`
- **New modules:** add optional server routes + admin pages; gate with `features` when nav filtering exists
- **One-off custom logic:** prefer minimal hooks in site config or a future `sites/{id}/extensions/` folder (not scaffolded yet)
- **Client rebrand:** `npm run rebrand -w @platform/storefront` (`scripts/rebrand-client.ts`)
- **API roadmap:** [client/backend_features_analysis.md](../client/backend_features_analysis.md) — full ecommerce roadmap; catalog + auth + cart/orders/wishlist/users are live; payments, coupons, reviews, and content APIs remain planned

## Deploy notes

- **Node version:** repo root `engines` and `client/Dockerfile` use **Node 20.x**.
- **Site registry:** `docs/site-registry.json` must stay in sync with `packages/site-config/src/sites/*.ts` (especially `features` and URLs).

## AI documentation

Cross-tool entry: [AGENTS.md](../AGENTS.md). Index + tree: [AI-INDEX.md](AI-INDEX.md). Sync policy: `.cursor/rules/documentation-sync.mdc`.
