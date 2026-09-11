#!/usr/bin/env tsx
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const siteId = args[0];
const templateFlagIndex = args.indexOf("--template");
const template =
  templateFlagIndex >= 0 ? args[templateFlagIndex + 1] : "general";

if (!siteId || siteId.startsWith("-")) {
  console.error(
    "Usage: npm run create-site <site-id> [--template beauty|sport|general]"
  );
  process.exit(1);
}

const slug = siteId.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
const siteDir = join(process.cwd(), "sites", slug);

if (existsSync(siteDir)) {
  console.error(`Site folder already exists: ${siteDir}`);
  process.exit(1);
}

mkdirSync(siteDir, { recursive: true });

const homeLayout =
  template === "beauty"
    ? "cosmetic-beauty-two"
    : template === "sport"
      ? "sport"
      : "general";

writeFileSync(
  join(siteDir, ".env.example"),
  `# Reference env for ${slug} — copy values into server/.env, admin/.env.local, client/.env.local

# --- Shared (all apps) ---
SITE_ID=${slug}
NEXT_PUBLIC_SITE_ID=${slug}

# --- Server only (server/.env) ---
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/${slug}
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=${slug}-media
GCS_KEY_FILE=./gcs-key.json

# Auth (JWT signing)
JWT_ACCESS_SECRET=dev-access-secret-change-me-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-me-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP) — password reset + email verification; optional in dev (links logged when unset)
# Mailpit: SMTP_HOST=localhost SMTP_PORT=1025
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
EMAIL_FROM=hello@example.com

# Google OAuth — same client ID as storefront NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=

# Seed users (npm run seed — catalog + admin + demo customer)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin
DEMO_CUSTOMER_EMAIL=customer@example.com
DEMO_CUSTOMER_PASSWORD=Customer123!
DEMO_CUSTOMER_NAME=Demo Customer
# Set SEED_DEMO_CUSTOMER=false to skip the demo storefront account

# Optional — disable auth/catalog rate limits in local testing
# SKIP_AUTH_RATE_LIMIT=1

# --- Admin + client ---
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Cookie max-age (seconds) — align with server JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN
NEXT_PUBLIC_ACCESS_TOKEN_MAX_AGE=900
NEXT_PUBLIC_REFRESH_TOKEN_MAX_AGE=604800

# --- Admin only (admin/.env.local) ---
# Path deploy only (e.g. example.com/admin): NEXT_PUBLIC_BASE_URL=/admin

# --- Client only (client/.env.local) ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FORMSPREE_ENDPOINT=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
# Path deploy only: NEXT_PUBLIC_BASE_URL=
`
);

writeFileSync(
  join(siteDir, "README.md"),
  `# ${slug}

Template: \`${template}\`
Home layout: \`${homeLayout}\`

## Next steps

1. Add \`packages/site-config/src/sites/${slug}.ts\`
2. Register the site in \`packages/site-config/src/index.ts\`
3. Add an entry to \`docs/site-registry.json\`
4. Copy env vars into \`client\`, \`admin\`, and \`server\`
5. Deploy with a dedicated MongoDB database and GCS bucket
`
);

console.log(`Created site scaffold at sites/${slug}`);
console.log("");
console.log("Next steps:");
console.log(`  1. Add packages/site-config/src/sites/${slug}.ts`);
console.log("  2. Register in packages/site-config/src/index.ts");
console.log("  3. Update docs/site-registry.json");
console.log(`  4. Create MongoDB database: ${slug}`);
