import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import {
  authHeader,
  createTestApp,
  registerAdmin,
  registerCustomer,
  seedDraftProduct,
  seedPublishedProduct,
  setupTestDatabase,
  teardownTestDatabase,
} from "./helpers.js";

describe("catalog API", () => {
  const app = createTestApp();

  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it("lists products publicly with status filter", async () => {
    const published = await seedPublishedProduct();
    await seedDraftProduct();

    const response = await request(app)
      .get("/api/products")
      .query({ status: "published", limit: 50 })
      .expect(200);

    assert.ok(response.body.total >= 1);
    assert.ok(
      response.body.data.some(
        (product: { id: string }) => product.id === published._id.toString()
      )
    );
    assert.ok(
      response.body.data.every(
        (product: { status: string }) => product.status === "published"
      )
    );
  });

  it("returns a single product by id", async () => {
    const product = await seedPublishedProduct();

    const response = await request(app)
      .get(`/api/products/${product._id.toString()}`)
      .expect(200);

    assert.equal(response.body.id, product._id.toString());
    assert.equal(response.body.name, product.name);
  });

  it("returns a single product by slug", async () => {
    const product = await seedPublishedProduct();

    const response = await request(app)
      .get(`/api/products/slug/${product.slug}`)
      .expect(200);

    assert.equal(response.body.id, product._id.toString());
    assert.equal(response.body.slug, product.slug);
  });

  it("returns 404 for unknown product slug", async () => {
    await request(app).get("/api/products/slug/does-not-exist").expect(404);
  });

  it("forbids customers from creating products", async () => {
    const { body } = await registerCustomer(app);

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Customer Product",
        sku: `CUST-${Date.now()}`,
        price: 9.99,
        stock: 1,
      })
      .expect(403);
  });

  it("allows admin to create, update, and delete a product", async () => {
    const { body } = await registerAdmin(app);
    const sku = `ADMIN-${Date.now()}`;

    const createResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Admin Created Serum",
        sku,
        price: 42,
        stock: 8,
        status: "published",
      })
      .expect(201);

    assert.equal(createResponse.body.name, "Admin Created Serum");
    assert.equal(createResponse.body.sku, sku);

    const autoSkuResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Auto Sku Product",
        price: 10,
        stock: 1,
      })
      .expect(201);

    assert.ok(autoSkuResponse.body.sku);
    assert.match(autoSkuResponse.body.sku, /^AUTOSKUPRO-/);

    const productId = createResponse.body.id;

    const patchResponse = await request(app)
      .patch(`/api/products/${productId}`)
      .set(authHeader(body.accessToken))
      .send({ price: 39.99 })
      .expect(200);

    assert.equal(patchResponse.body.price, 39.99);

    await request(app)
      .delete(`/api/products/${productId}`)
      .set(authHeader(body.accessToken))
      .expect(204);

    await request(app).get(`/api/products/${productId}`).expect(404);
  });

  it("lists categories and brands publicly", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .post("/api/categories")
      .set(authHeader(body.accessToken))
      .send({ name: `Test Category ${Date.now()}`, status: "published" })
      .expect(201);

    await request(app)
      .post("/api/brands")
      .set(authHeader(body.accessToken))
      .send({ name: `Test Brand ${Date.now()}`, status: "published" })
      .expect(201);

    const categories = await request(app)
      .get("/api/categories")
      .query({ status: "published" })
      .expect(200);

    const brands = await request(app)
      .get("/api/brands")
      .query({ status: "published" })
      .expect(200);

    assert.ok(categories.body.total >= 1);
    assert.ok(brands.body.total >= 1);
  });

  it("lists attributes publicly", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .post("/api/attributes")
      .set(authHeader(body.accessToken))
      .send({
        name: `Color ${Date.now()}`,
        displayType: "Swatch",
        status: "active",
        values: ["Red", "Blue"],
      })
      .expect(201);

    const response = await request(app)
      .get("/api/attributes")
      .query({ status: "active" })
      .expect(200);

    assert.ok(response.body.total >= 1);
  });

  it("blocks category delete when products reference it", async () => {
    const { body } = await registerAdmin(app);

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set(authHeader(body.accessToken))
      .send({ name: `Blocked Category ${Date.now()}`, status: "published" })
      .expect(201);

    const categoryId = categoryResponse.body.id;

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Category Linked Product",
        sku: `CAT-LINK-${Date.now()}`,
        price: 12,
        stock: 3,
        status: "published",
        categoryId,
      })
      .expect(201);

    const deleteResponse = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set(authHeader(body.accessToken))
      .expect(409);

    assert.match(deleteResponse.body.error, /still reference it/);
  });

  it("allows category delete when no products reference it", async () => {
    const { body } = await registerAdmin(app);

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set(authHeader(body.accessToken))
      .send({ name: `Empty Category ${Date.now()}`, status: "published" })
      .expect(201);

    const categoryId = categoryResponse.body.id;

    await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set(authHeader(body.accessToken))
      .expect(204);

    await request(app).get(`/api/categories/${categoryId}`).expect(404);
  });

  it("blocks brand delete when products reference it", async () => {
    const { body } = await registerAdmin(app);

    const brandResponse = await request(app)
      .post("/api/brands")
      .set(authHeader(body.accessToken))
      .send({ name: `Blocked Brand ${Date.now()}`, status: "published" })
      .expect(201);

    const brandId = brandResponse.body.id;

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Brand Linked Product",
        sku: `BRAND-LINK-${Date.now()}`,
        price: 12,
        stock: 3,
        status: "published",
        brandId,
      })
      .expect(201);

    const deleteResponse = await request(app)
      .delete(`/api/brands/${brandId}`)
      .set(authHeader(body.accessToken))
      .expect(409);

    assert.match(deleteResponse.body.error, /still reference it/);
  });

  it("propagates category rename to linked products", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set(authHeader(body.accessToken))
      .send({ name: `Original Category ${suffix}`, status: "published" })
      .expect(201);

    const categoryId = categoryResponse.body.id;

    const productResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Rename Category Product",
        sku: `RENAME-CAT-${suffix}`,
        price: 10,
        stock: 1,
        status: "published",
        categoryId,
      })
      .expect(201);

    const renamed = `Renamed Category ${suffix}`;
    await request(app)
      .patch(`/api/categories/${categoryId}`)
      .set(authHeader(body.accessToken))
      .send({ name: renamed })
      .expect(200);

    const product = await request(app)
      .get(`/api/products/${productResponse.body.id}`)
      .expect(200);

    assert.equal(product.body.categoryName, renamed);
  });

  it("returns 404 when product references missing category", async () => {
    const { body } = await registerAdmin(app);

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Missing Category Product",
        sku: `MISSING-CAT-${Date.now()}`,
        price: 10,
        stock: 1,
        categoryId: "507f1f77bcf86cd799439011",
      })
      .expect(404);
  });

  it("tracks attribute usage counts on products", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const attributeResponse = await request(app)
      .post("/api/attributes")
      .set(authHeader(body.accessToken))
      .send({
        name: `Finish ${suffix}`,
        displayType: "Dropdown",
        status: "active",
        values: ["Matte", "Gloss"],
      })
      .expect(201);

    const attributeSlug = attributeResponse.body.slug;
    assert.equal(attributeResponse.body.productCount, 0);

    const productResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Attribute Count Product",
        sku: `ATTR-COUNT-${suffix}`,
        price: 15,
        stock: 2,
        status: "published",
        attributes: { [attributeSlug]: "Matte" },
      })
      .expect(201);

    const attribute = await request(app)
      .get(`/api/attributes/${attributeResponse.body.id}`)
      .expect(200);

    assert.equal(attribute.body.productCount, 1);

    await request(app)
      .delete(`/api/products/${productResponse.body.id}`)
      .set(authHeader(body.accessToken))
      .expect(204);

    const attributeAfterDelete = await request(app)
      .get(`/api/attributes/${attributeResponse.body.id}`)
      .expect(200);

    assert.equal(attributeAfterDelete.body.productCount, 0);
  });

  it("blocks attribute delete when products reference it", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const attributeResponse = await request(app)
      .post("/api/attributes")
      .set(authHeader(body.accessToken))
      .send({
        name: `Blocked Attribute ${suffix}`,
        displayType: "Dropdown",
        status: "active",
        values: ["Small", "Large"],
      })
      .expect(201);

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Attribute Linked Product",
        sku: `ATTR-LINK-${suffix}`,
        price: 12,
        stock: 3,
        status: "published",
        attributes: { [attributeResponse.body.slug]: "Small" },
      })
      .expect(201);

    const deleteResponse = await request(app)
      .delete(`/api/attributes/${attributeResponse.body.id}`)
      .set(authHeader(body.accessToken))
      .expect(409);

    assert.match(deleteResponse.body.error, /still reference it/);
  });

  it("propagates brand rename to linked products", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const brandResponse = await request(app)
      .post("/api/brands")
      .set(authHeader(body.accessToken))
      .send({
        name: `Original Brand ${suffix}`,
        status: "published",
        visibility: "Standard",
      })
      .expect(201);

    const brandId = brandResponse.body.id;

    const productResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Rename Brand Product",
        sku: `RENAME-BRAND-${suffix}`,
        price: 10,
        stock: 1,
        status: "published",
        brandId,
      })
      .expect(201);

    const renamed = `Renamed Brand ${suffix}`;
    await request(app)
      .patch(`/api/brands/${brandId}`)
      .set(authHeader(body.accessToken))
      .send({ name: renamed })
      .expect(200);

    const product = await request(app)
      .get(`/api/products/${productResponse.body.id}`)
      .expect(200);

    assert.equal(product.body.brandName, renamed);
  });

  it("keeps product slug when the name is updated", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const productResponse = await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: `Original Product ${suffix}`,
        sku: `SLUG-KEEP-${suffix}`,
        price: 10,
        stock: 1,
        status: "published",
      })
      .expect(201);

    const originalSlug = productResponse.body.slug;
    const renamed = `Renamed Product ${suffix}`;

    await request(app)
      .patch(`/api/products/${productResponse.body.id}`)
      .set(authHeader(body.accessToken))
      .send({ name: renamed })
      .expect(200);

    const product = await request(app)
      .get(`/api/products/${productResponse.body.id}`)
      .expect(200);

    assert.equal(product.body.slug, originalSlug);
    assert.equal(product.body.name, renamed);
  });

  it("blocks removing attribute values still used by products", async () => {
    const { body } = await registerAdmin(app);
    const suffix = Date.now();

    const attributeResponse = await request(app)
      .post("/api/attributes")
      .set(authHeader(body.accessToken))
      .send({
        name: `Finish Guard ${suffix}`,
        displayType: "Dropdown",
        status: "active",
        values: ["Matte", "Gloss"],
      })
      .expect(201);

    await request(app)
      .post("/api/products")
      .set(authHeader(body.accessToken))
      .send({
        name: "Attribute Value Guard Product",
        sku: `ATTR-VAL-${suffix}`,
        price: 12,
        stock: 3,
        status: "published",
        attributes: { [attributeResponse.body.slug]: "Matte" },
      })
      .expect(201);

    const patchResponse = await request(app)
      .patch(`/api/attributes/${attributeResponse.body.id}`)
      .set(authHeader(body.accessToken))
      .send({ values: ["Gloss"] })
      .expect(409);

    assert.match(patchResponse.body.error, /still use it/);
  });
});
