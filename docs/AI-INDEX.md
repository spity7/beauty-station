# Documentation index (AI & developers)

Central map for humans and AI assistants. Update **Last reviewed** when you change the linked doc.

## Documentation tree

```text
ecommerce-platform/
├── AGENTS.md                         ← AI entry (Cursor, Claude, Gemini, Copilot)
├── CLAUDE.md                         ← Claude Code commands
├── GEMINI.md                         ← Antigravity / Gemini overrides
├── README.md                         ← Human quick start
├── .github/
│   └── copilot-instructions.md       ← GitHub Copilot entry
├── .cursor/rules/                    ← Platform-wide Cursor rules
│   ├── documentation-sync.mdc        alwaysApply
│   ├── api-contract.mdc              alwaysApply
│   ├── multi-site.mdc                alwaysApply
│   ├── storefront-ui.mdc             globs: client/**/*
│   └── admin-ui.mdc                  globs: admin/**/*
├── client/
│   ├── README.md                     ← Storefront workspace
│   ├── backend_features_analysis.md  ← API roadmap (partially implemented)
│   └── .cursor/rules/
│       └── product-tab-filtering-pattern.mdc   alwaysApply (client)
├── admin/README.md                   ← Admin workspace
├── docs/                             ← Long-form platform docs (you are here)
│   ├── AI-INDEX.md
│   ├── ARCHITECTURE.md
│   ├── ROUTES.md
│   ├── CONVENTIONS.md
│   └── site-registry.json
└── sites/
    └── beauty-station/README.md      ← Per-site env / deploy notes
```

**Reading order for AI:** `AGENTS.md` → this file → topic doc (`ARCHITECTURE`, `ROUTES`, or `CONVENTIONS`).

## Documents

| Document                                                                         | Purpose                                                   | Last reviewed |
| -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                               | Monorepo layout, multi-site, OpenAPI/Orval, CI, new sites | 2026-09-11    |
| [ROUTES.md](ROUTES.md)                                                           | HTTP API + admin/storefront route inventory               | 2026-09-12    |
| [CONVENTIONS.md](CONVENTIONS.md)                                                 | Naming, UI stacks, patterns per workspace                 | 2026-09-11    |
| [../admin/README.md](../admin/README.md)                                         | Admin workspace scope + API integration                   | 2026-09-05    |
| [site-registry.json](site-registry.json)                                         | Deployed sites metadata (DB, GCS, URLs, features)         | 2026-08-22    |
| [../AGENTS.md](../AGENTS.md)                                                     | Cross-tool agent entry                                    | 2026-08-24    |
| [../CLAUDE.md](../CLAUDE.md)                                                     | Claude Code quick commands                                | 2026-08-22    |
| [../GEMINI.md](../GEMINI.md)                                                     | Antigravity / Gemini overrides                            | 2026-08-20    |
| [../README.md](../README.md)                                                     | Human quick start                                         | 2026-08-28    |
| [../.github/copilot-instructions.md](../.github/copilot-instructions.md)         | GitHub Copilot entry                                      | 2026-08-20    |
| [../client/backend_features_analysis.md](../client/backend_features_analysis.md) | API roadmap / planned endpoints (partial)                 | 2026-09-11    |

## Cursor rules

### Always apply (`.cursor/rules/`)

| Rule                     | When it applies                                        |
| ------------------------ | ------------------------------------------------------ |
| `documentation-sync.mdc` | Any change that affects documented behavior            |
| `api-contract.mdc`       | Zod schemas, OpenAPI registry, Orval, generated client |
| `multi-site.mdc`         | Site config, env vars, `create-site`                   |

### Scoped by path (`.cursor/rules/`)

| Rule                | Globs         |
| ------------------- | ------------- |
| `storefront-ui.mdc` | `client/**/*` |
| `admin-ui.mdc`      | `admin/**/*`  |

### Client workspace (`client/.cursor/rules/`)

| Rule                                | When it applies                           |
| ----------------------------------- | ----------------------------------------- |
| `product-tab-filtering-pattern.mdc` | Tab-driven product sections on storefront |

## Workspace READMEs

| Path                                                                   | Audience                          |
| ---------------------------------------------------------------------- | --------------------------------- |
| [../client/README.md](../client/README.md)                             | Storefront developers             |
| [../admin/README.md](../admin/README.md)                               | Admin dashboard developers        |
| [../sites/beauty-station/README.md](../sites/beauty-station/README.md) | Beauty Station env / deploy notes |

## Sync policy

When code changes behavior, contracts, routes, or conventions, update the matching row above in the **same PR**. See `.cursor/rules/documentation-sync.mdc` for the full change → doc matrix.

**Registry rule:** `docs/site-registry.json` `features` must match `packages/site-config/src/sites/{id}.ts` for each site.
