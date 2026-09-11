# Ecommerce Platform

Multipurpose ecommerce monorepo. **Beauty Station** is the first site instance.

## Documentation

| Audience                                            | Start here                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| **AI assistants** (Cursor, Claude, Gemini, Copilot) | [AGENTS.md](AGENTS.md) → [docs/AI-INDEX.md](docs/AI-INDEX.md) (includes doc tree) |
| **Developers**                                      | This README + [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                        |
| **Claude Code**                                     | [CLAUDE.md](CLAUDE.md)                                                            |

Docs stay in sync via [.cursor/rules/documentation-sync.mdc](.cursor/rules/documentation-sync.mdc) — update docs in the same change when behavior or contracts change.

## Structure

| Path                    | npm name                | Role                        |
| ----------------------- | ----------------------- | --------------------------- |
| `client/`               | `@platform/storefront`  | Storefront (Next.js)        |
| `admin/`                | `@platform/admin`       | Admin dashboard (Next.js)   |
| `server/`               | `@platform/server`      | Express API + MongoDB       |
| `packages/shared`       | `@platform/shared`      | Types & Zod schemas         |
| `packages/site-config`  | `@platform/site-config` | Per-site config registry    |
| `packages/api-client`   | `@platform/api-client`  | OpenAPI + Orval client      |
| `sites/beauty-station/` | —                       | Beauty Station env template |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

## Quick start

```bash
npm install
npm run build:packages
npm run dev:server
npm run seed          # Fresh catalog + admin + demo customer (see server/.env ADMIN_* / DEMO_CUSTOMER_*)
npm run seed:admin   # Admin user only (when catalog already exists)
npm run dev:admin
npm run dev:client
```

| App        | URL                   |
| ---------- | --------------------- |
| Storefront | http://localhost:3000 |
| Admin      | http://localhost:3001 |
| API        | http://localhost:5000 |

Copy `.env.example` from each app (and `sites/beauty-station/.env.example`) into `.env.local` / `.env` as needed.

**Optional storefront Google sign-in:** set matching `GOOGLE_CLIENT_ID` (server) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (client). Create a Google Cloud OAuth Web client with `http://localhost:3000` as an authorized JavaScript origin. **Email verification:** register sends a verification link when SMTP is configured (logged in dev without SMTP). Customers must verify email before placing orders.

**Node:** 20.x

## Common commands

```bash
npm run api:generate   # Regenerate OpenAPI + client after API changes
npm run typecheck      # Full monorepo typecheck
npm run format:check   # Prettier across workspaces
npm run create-site sport-shop -- --template sport
```

## New site

```bash
npm run create-site sport-shop -- --template sport
```

Then add site config, register in `packages/site-config`, and update `docs/site-registry.json`. Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
