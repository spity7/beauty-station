import { after, before, describe, it } from "node:test";
import request from "supertest";
import {
  authHeader,
  createTestApp,
  registerAdmin,
  registerCustomer,
  setupTestDatabase,
  teardownTestDatabase,
} from "./helpers.js";

describe("uploads API", () => {
  const app = createTestApp();

  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it("returns 503 when GCS is not configured", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .post("/api/uploads")
      .set(authHeader(body.accessToken))
      .field("folder", "products")
      .attach("file", Buffer.from("not-an-image"), {
        filename: "test.png",
        contentType: "image/png",
      })
      .expect(503);
  });

  it("requires authentication", async () => {
    await request(app).post("/api/uploads").send({}).expect(401);
  });

  it("forbids non-admin users", async () => {
    const { body } = await registerCustomer(app);

    await request(app)
      .post("/api/uploads")
      .set(authHeader(body.accessToken))
      .send({})
      .expect(403);
  });

  it("rejects invalid upload folders", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .post("/api/uploads")
      .set(authHeader(body.accessToken))
      .field("folder", "avatars")
      .attach("file", Buffer.from("not-an-image"), {
        filename: "test.png",
        contentType: "image/png",
      })
      .expect(400);
  });

  it("returns 503 when deleting and GCS is not configured", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .delete("/api/uploads")
      .set(authHeader(body.accessToken))
      .send({
        url: "https://storage.googleapis.com/test-bucket/products/image.webp",
      })
      .expect(503);
  });

  it("requires authentication to delete uploads", async () => {
    await request(app)
      .delete("/api/uploads")
      .send({
        url: "https://storage.googleapis.com/test-bucket/products/image.webp",
      })
      .expect(401);
  });

  it("forbids non-admin users from deleting uploads", async () => {
    const { body } = await registerCustomer(app);

    await request(app)
      .delete("/api/uploads")
      .set(authHeader(body.accessToken))
      .send({
        url: "https://storage.googleapis.com/test-bucket/products/image.webp",
      })
      .expect(403);
  });

  it("rejects unsupported catalog image URLs on delete", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .delete("/api/uploads")
      .set(authHeader(body.accessToken))
      .send({ url: "https://example.com/products/image.webp" })
      .expect(400);
  });
});
