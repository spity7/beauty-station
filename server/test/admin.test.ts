import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import {
  authHeader,
  createTestApp,
  registerAdmin,
  registerCustomer,
  setupTestDatabase,
  teardownTestDatabase,
} from "./helpers.js";

describe("admin users API", () => {
  const app = createTestApp();

  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it("lists customers for admin", async () => {
    const customer = await registerCustomer(app);
    const admin = await registerAdmin(app);

    const response = await request(app)
      .get("/api/admin/users")
      .set(authHeader(admin.body.accessToken))
      .expect(200);

    assert.ok(response.body.total >= 1);
    assert.ok(
      response.body.data.some(
        (row: { email: string }) => row.email === customer.email
      )
    );
  });

  it("disables a customer and blocks login", async () => {
    const customer = await registerCustomer(app);
    const admin = await registerAdmin(app);

    const listResponse = await request(app)
      .get("/api/admin/users")
      .set(authHeader(admin.body.accessToken))
      .expect(200);

    const row = listResponse.body.data.find(
      (entry: { email: string }) => entry.email === customer.email
    );
    assert.ok(row);

    await request(app)
      .patch(`/api/admin/users/${row.id}/status`)
      .set(authHeader(admin.body.accessToken))
      .send({ isActive: false })
      .expect(200);

    await request(app)
      .post("/api/auth/login")
      .send({ email: customer.email, password: "Password1!Strong" })
      .expect(403);
  });

  it("rejects non-admin access to admin users API", async () => {
    const customer = await registerCustomer(app);

    await request(app)
      .get("/api/admin/users")
      .set(authHeader(customer.body.accessToken))
      .expect(403);
  });
});
