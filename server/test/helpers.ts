import "./setup-env.js";
import type { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import type { AuthResponse } from "@platform/shared";
import { createApp } from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { Product } from "../src/models/Product.js";
import { User } from "../src/models/User.js";
import type { ProductDocument } from "../src/models/Product.js";

export const TEST_PHONE = "+12025550100";
export const TEST_CATEGORY_IMAGE = "https://example.com/category.jpg";

export function createTestApp(): Express {
  return createApp();
}

export async function setupTestDatabase(): Promise<void> {
  await connectDatabase();
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await disconnectDatabase();
}

export async function seedPublishedProduct(): Promise<ProductDocument> {
  return Product.create({
    name: "Integration Test Serum",
    slug: `test-serum-${Date.now()}`,
    sku: `TEST-${Date.now()}`,
    price: 29.99,
    stock: 25,
    status: "published",
  });
}

export async function seedDraftProduct(): Promise<ProductDocument> {
  return Product.create({
    name: "Draft Test Product",
    slug: `draft-product-${Date.now()}`,
    sku: `DRAFT-${Date.now()}`,
    price: 19.99,
    stock: 10,
    status: "draft",
  });
}

export async function registerAdmin(
  app: Express,
  email = `admin-${Date.now()}@example.com`
): Promise<{ body: AuthResponse; email: string }> {
  const password = "Password1!Strong";
  await registerCustomer(app, email);
  await User.updateOne({ email }, { $set: { role: "admin" } });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email, password })
    .expect(200);

  return { body: loginResponse.body as AuthResponse, email };
}

export async function registerCustomer(
  app: Express,
  email = `customer-${Date.now()}@example.com`
): Promise<{ body: AuthResponse; email: string }> {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test Customer",
      email,
      password: "Password1!Strong",
      phone: TEST_PHONE,
    })
    .expect(201);

  return { body: response.body as AuthResponse, email };
}

export function authHeader(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}

export function testGoogleIdToken(
  email: string,
  sub = "google-test-sub",
  picture?: string
): string {
  const base = `test-google|${email.toLowerCase()}|${sub}`;
  return picture ? `${base}|${picture}` : base;
}

export async function verifyCustomerEmail(
  app: Express,
  accessToken: string
): Promise<void> {
  const requestResponse = await request(app)
    .post("/api/auth/request-email-verification")
    .set(authHeader(accessToken))
    .expect(200);

  const token = requestResponse.body.devVerificationToken;
  if (!token) {
    throw new Error("Expected devVerificationToken in test environment");
  }

  await request(app).post("/api/auth/verify-email").send({ token }).expect(200);
}

export async function registerGoogleCustomer(
  app: Express,
  email = `google-${Date.now()}@example.com`,
  sub = `google-sub-${Date.now()}`
): Promise<{ body: AuthResponse; email: string; sub: string }> {
  const response = await request(app)
    .post("/api/auth/social")
    .send({
      provider: "google",
      idToken: testGoogleIdToken(email, sub),
    })
    .expect(201);

  return {
    body: response.body as AuthResponse,
    email,
    sub,
  };
}
