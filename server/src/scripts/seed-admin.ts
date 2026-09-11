import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { seedAdminUser } from "./lib/seed-users.js";

async function seedAdmin() {
  await connectDatabase();

  const admin = await seedAdminUser();
  console.log(
    `${admin.action === "created" ? "Created" : "Updated"} admin user: ${admin.email}`
  );

  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      `Using default dev password for ${admin.email}. Set ADMIN_PASSWORD in server/.env for production.`
    );
  }

  await disconnectDatabase();
}

seedAdmin().catch(async (error) => {
  console.error("Admin seed failed:", error);
  await disconnectDatabase();
  process.exit(1);
});
