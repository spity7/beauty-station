# Admin dashboard (`@platform/admin`)

Next.js admin UI for the ecommerce platform. Runs on **port 3001** in development.

Part of the monorepo — run commands from **repo root** unless noted. Platform docs: [AGENTS.md](../AGENTS.md), [docs/AI-INDEX.md](../docs/AI-INDEX.md), [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), [docs/ROUTES.md](../docs/ROUTES.md).

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Lucide icons, ECharts
- `@platform/api-client` for catalog API calls

## Prerequisites

- Node.js **20.x**
- MongoDB seeded (`npm run seed` from root) for catalog list and CRUD pages

## Development

From repo root:

```bash
npm run dev:admin
```

Open [http://localhost:3001](http://localhost:3001).

`predev` runs `api:ensure` and `build:packages` automatically.

## Environment

Copy `admin/.env.example` → `admin/.env.local`:

- `NEXT_PUBLIC_SITE_ID` — site config (default `beauty-station`)
- `NEXT_PUBLIC_API_URL` — backend (default `http://localhost:5000`)
- `NEXT_PUBLIC_BASE_URL` — optional subdirectory `basePath`

## Scripts

| Command                            | Purpose               |
| ---------------------------------- | --------------------- |
| `npm run dev -w @platform/admin`   | Dev server (:3001)    |
| `npm run build -w @platform/admin` | Production build      |
| `npm run check -w @platform/admin` | Prettier + Biome lint |
| `npm run lint -w @platform/admin`  | Biome only            |

## Project structure

```text
app/
  (auth)/signin/          JWT sign-in (admin role required)
  (auth)/forgot-password/ Admin password reset
  (dashboard)/            Dashboard pages
config/                   routes.ts, navigation.ts, site.ts
components/               layout, products, charts, auth, …
lib/                      auth, session, site helpers, API mappers
providers/                app + auth session providers
proxy.ts                  Route gate via /api/auth/me (admin role)
```

## API integration

**Connected today:** catalog list + CRUD (products, categories, brands, attributes) via `components/catalog/*-catalog-form.tsx` and `ProductCatalogForm` (includes published-attribute picker); orders list/detail (`ApiOrdersPanel`). Slugs are server-generated — not editable in admin forms.

**Template only:** dashboard home, customers, coupons, settings, reports, and most other nav items use demo data. See [docs/ROUTES.md](../docs/ROUTES.md).

## Auth

JWT sign-in against `POST /api/auth/login`. Only users with `role: admin` may enter the dashboard. [`proxy.ts`](proxy.ts) validates each request via `GET /api/auth/me`. Tokens live in cookies + in-memory Bearer header for mutations. Logout calls `POST /api/auth/logout`. Forgot password: `/forgot-password` and `/reset-password` (magic links; SMTP required in production).

**First admin:** `npm run seed:admin` from repo root (see [docs/CONVENTIONS.md](../docs/CONVENTIONS.md)).

Do not expose admin publicly without strong JWT secrets (`NODE_ENV=production` rejects default secrets on the server).

## Conventions

- Navigation: `config/routes.ts` + `config/navigation.ts`
- Styling: semantic Tailwind tokens in `app/globals.css`
- Cursor rules: `.cursor/rules/admin-ui.mdc`

## Quality

```bash
npm run check -w @platform/admin
npm run build -w @platform/admin
```

Root CI runs `api:check`, `build:packages`, and `typecheck` — not admin lint/build yet.
