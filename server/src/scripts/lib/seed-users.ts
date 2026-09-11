import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";
const DEFAULT_ADMIN_NAME = "Admin";

const DEFAULT_DEMO_CUSTOMER_EMAIL = "customer@example.com";
const DEFAULT_DEMO_CUSTOMER_PASSWORD = "Customer123!";
const DEFAULT_DEMO_CUSTOMER_NAME = "Demo Customer";

export type SeedUserResult = {
  email: string;
  password: string;
  role: "admin" | "customer";
  action: "created" | "updated";
};

function resolveAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  return email.toLowerCase();
}

function resolveAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

function resolveAdminName(): string {
  return process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME;
}

function resolveDemoCustomerEmail(): string {
  const email =
    process.env.DEMO_CUSTOMER_EMAIL?.trim() || DEFAULT_DEMO_CUSTOMER_EMAIL;
  return email.toLowerCase();
}

function resolveDemoCustomerPassword(): string {
  return (
    process.env.DEMO_CUSTOMER_PASSWORD?.trim() ||
    DEFAULT_DEMO_CUSTOMER_PASSWORD
  );
}

function resolveDemoCustomerName(): string {
  return process.env.DEMO_CUSTOMER_NAME?.trim() || DEFAULT_DEMO_CUSTOMER_NAME;
}

function shouldSeedDemoCustomer(): boolean {
  const value = process.env.SEED_DEMO_CUSTOMER?.trim().toLowerCase();
  return value !== "0" && value !== "false" && value !== "no";
}

async function upsertPasswordUser(input: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "customer";
}): Promise<SeedUserResult> {
  if (input.password.length < 8) {
    throw new Error(`Password for ${input.email} must be at least 8 characters.`);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const existing = await User.findOne({ email: input.email });

  if (existing) {
    existing.name = input.name;
    existing.passwordHash = passwordHash;
    existing.role = input.role;
    existing.emailVerified = true;
    existing.passwordSetByUser = true;
    existing.isActive = true;
    existing.deletedAt = undefined;
    existing.refreshTokenVersion = (existing.refreshTokenVersion ?? 0) + 1;
    await existing.save();

    return {
      email: input.email,
      password: input.password,
      role: input.role,
      action: "updated",
    };
  }

  await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
    emailVerified: true,
    passwordSetByUser: true,
    isActive: true,
  });

  return {
    email: input.email,
    password: input.password,
    role: input.role,
    action: "created",
  };
}

export async function seedAdminUser(): Promise<SeedUserResult> {
  return upsertPasswordUser({
    email: resolveAdminEmail(),
    password: resolveAdminPassword(),
    name: resolveAdminName(),
    role: "admin",
  });
}

export async function seedDemoCustomerUser(): Promise<SeedUserResult | null> {
  if (!shouldSeedDemoCustomer()) {
    return null;
  }

  return upsertPasswordUser({
    email: resolveDemoCustomerEmail(),
    password: resolveDemoCustomerPassword(),
    name: resolveDemoCustomerName(),
    role: "customer",
  });
}

export async function clearCustomerUsers(): Promise<number> {
  const result = await User.deleteMany({ role: "customer" });
  return result.deletedCount ?? 0;
}

export function getDefaultCredentialHints(): {
  adminUsesDefaultPassword: boolean;
  demoUsesDefaultPassword: boolean;
} {
  return {
    adminUsesDefaultPassword: !process.env.ADMIN_PASSWORD?.trim(),
    demoUsesDefaultPassword: !process.env.DEMO_CUSTOMER_PASSWORD?.trim(),
  };
}
