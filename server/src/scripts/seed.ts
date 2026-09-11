import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { getSeedDataForSite } from "./seed-data/index.js";
import {
  clearCatalogData,
  clearCommerceData,
  seedCatalog,
} from "./lib/seed-catalog.js";
import { printSeedSummary } from "./lib/seed-output.js";
import {
  clearCustomerUsers,
  getDefaultCredentialHints,
  seedAdminUser,
  seedDemoCustomerUser,
} from "./lib/seed-users.js";

async function seed() {
  const seedData = getSeedDataForSite(env.SITE_ID, env.site.homeLayout);

  await connectDatabase();

  await clearCommerceData();
  const removedCustomers = await clearCustomerUsers();
  await clearCatalogData();

  const catalog = await seedCatalog(seedData);
  const admin = await seedAdminUser();
  const demoCustomer = await seedDemoCustomerUser();

  printSeedSummary({
    siteName: env.site.name,
    siteId: env.SITE_ID,
    datasetLabel: seedData.label,
    catalog,
    admin,
    demoCustomer,
    removedCustomers,
    credentialHints: getDefaultCredentialHints(),
  });

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await disconnectDatabase();
  process.exit(1);
});
