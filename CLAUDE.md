# Ecommerce Platform — Claude Developer Guide

Quick commands and conventions for developing, building, and maintaining the monorepo.

## Build & Dev Commands

Run from **repo root** unless noted.

| Command                           | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `npm install`                     | Install all workspaces                                 |
| `npm run build:packages`          | Build shared → site-config → react-busy → api-client   |
| `npm run dev:server`              | API on :5000 (`predev`: api:ensure + build:packages)   |
| `npm run dev:admin`               | Admin on :3001                                         |
| `npm run dev:client`              | Storefront on :3000                                    |
| `npm run seed`                    | Fresh catalog + commerce reset + admin + demo customer |
| `npm run seed:admin`              | Admin user only (`ADMIN_*` in server env)              |
| `npm run api:generate`            | Regenerate OpenAPI + Orval client                      |
| `npm run api:check`               | CI: fail if contract artifacts are stale               |
| `npm run typecheck`               | Typecheck all workspaces                               |
| `npm run test`                    | Build packages + API integration tests (needs MongoDB) |
| `npm run format` / `format:check` | Prettier (api-client, admin, storefront, server)       |
| `npm run create-site <id>`        | Scaffold `sites/<id>/`                                 |

**Per workspace:**

- Admin: `npm run check -w @platform/admin` (format + Biome lint)
- Client: `npm run lint -w @platform/storefront`, `npm run analyze` (bundle)
- Server: `npm run openapi:generate -w @platform/server` (spec only), `npm run test -w @platform/server` (after `build:packages`)

## Key Guidelines

1. **Core standards:** [AGENTS.md](AGENTS.md) and [docs/CONVENTIONS.md](docs/CONVENTIONS.md).
2. **Docs sync:** When changing contracts, routes, site config, or shared conventions, update docs in the same PR — see [.cursor/rules/documentation-sync.mdc](.cursor/rules/documentation-sync.mdc).
3. **API client:** Never hand-edit `packages/api-client/src/generated/**`. Change Zod schemas + OpenAPI registry, then `npm run api:generate`.
4. **Multi-site:** Resolve site via `getSiteConfig()` — never hardcode `beauty-station` in feature code (defaults in env are OK).
5. **Security:** No auth on API or admin routes yet — flag this when adding public-facing deploy guidance.

## Documentation map

- [docs/AI-INDEX.md](docs/AI-INDEX.md) — index with last-reviewed dates
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layout, OpenAPI, CI, new sites
- [docs/ROUTES.md](docs/ROUTES.md) — HTTP + app route inventory
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — naming, UI stacks, patterns
