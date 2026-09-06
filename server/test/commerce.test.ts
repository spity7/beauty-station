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
  TEST_PHONE,
  verifyCustomerEmail,
} from "./helpers.js";
import { Cart } from "../src/models/Cart.js";
import { Product } from "../src/models/Product.js";

describe("commerce API", () => {
  const app = createTestApp();

  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it("adds cart items and places an order", async () => {
    const product = await seedPublishedProduct();
    const { body } = await registerCustomer(app);
    await verifyCustomerEmail(app, body.accessToken);

    const addResponse = await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);

    assert.equal(addResponse.body.itemCount, 2);
    assert.equal(addResponse.body.items.length, 1);
    assert.equal(addResponse.body.items[0].quantity, 2);

    const orderResponse = await request(app)
      .post("/api/orders")
      .set(authHeader(body.accessToken))
      .send({
        shippingAddress: {
          name: "Test Customer",
          line1: "123 Test Street",
          city: "Austin",
          country: "United States",
          phone: TEST_PHONE,
        },
      })
      .expect(201);

    assert.equal(orderResponse.body.status, "pending");
    assert.equal(orderResponse.body.itemCount, 2);
    assert.equal(orderResponse.body.customerEmail, body.user.email);

    const ordersResponse = await request(app)
      .get("/api/orders")
      .set(authHeader(body.accessToken))
      .expect(200);

    assert.equal(ordersResponse.body.data.length, 1);
    assert.equal(ordersResponse.body.total, 1);
  });

  it("supports guest cart with X-Guest-Cart-Id header", async () => {
    const product = await seedPublishedProduct();
    const guestSessionId = `guest-${Date.now()}`;

    await request(app)
      .post("/api/cart/items")
      .set("X-Guest-Cart-Id", guestSessionId)
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const cartResponse = await request(app)
      .get("/api/cart")
      .set("X-Guest-Cart-Id", guestSessionId)
      .expect(200);

    assert.equal(cartResponse.body.itemCount, 1);
  });

  it("merges a guest cart into the user cart on login", async () => {
    const product = await seedPublishedProduct();
    const guestSessionId = `guest-merge-${Date.now()}`;
    const { body } = await registerCustomer(app);
    await verifyCustomerEmail(app, body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set("X-Guest-Cart-Id", guestSessionId)
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);

    const mergeResponse = await request(app)
      .post("/api/cart/merge")
      .set(authHeader(body.accessToken))
      .send({ guestSessionId })
      .expect(200);

    assert.equal(mergeResponse.body.itemCount, 2);
  });

  it("deletes an empty guest cart on merge", async () => {
    const guestSessionId = `guest-empty-merge-${Date.now()}`;
    const { body } = await registerCustomer(app);
    await verifyCustomerEmail(app, body.accessToken);

    await request(app)
      .get("/api/cart")
      .set("X-Guest-Cart-Id", guestSessionId)
      .expect(200);

    const mergeResponse = await request(app)
      .post("/api/cart/merge")
      .set(authHeader(body.accessToken))
      .send({ guestSessionId })
      .expect(200);

    assert.equal(mergeResponse.body.itemCount, 0);
    assert.equal(await Cart.findOne({ guestSessionId }), null);
  });

  it("is idempotent when merge is called twice", async () => {
    const product = await seedPublishedProduct();
    const guestSessionId = `guest-idempotent-${Date.now()}`;
    const { body } = await registerCustomer(app);
    await verifyCustomerEmail(app, body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set("X-Guest-Cart-Id", guestSessionId)
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    await request(app)
      .post("/api/cart/merge")
      .set(authHeader(body.accessToken))
      .send({ guestSessionId })
      .expect(200);

    const secondMerge = await request(app)
      .post("/api/cart/merge")
      .set(authHeader(body.accessToken))
      .send({ guestSessionId })
      .expect(200);

    assert.equal(secondMerge.body.itemCount, 1);
    assert.equal(await Cart.findOne({ guestSessionId }), null);
    assert.equal(await Cart.countDocuments({ userId: body.user.id }), 1);
  });

  it("updates, removes, and clears cart items", async () => {
    const product = await seedPublishedProduct();
    const { body } = await registerCustomer(app);

    const addResponse = await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);

    const itemId = addResponse.body.items[0].id;

    const patchResponse = await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set(authHeader(body.accessToken))
      .send({ quantity: 3 })
      .expect(200);

    assert.equal(patchResponse.body.items[0].quantity, 3);

    const removeResponse = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set(authHeader(body.accessToken))
      .expect(200);

    assert.equal(removeResponse.body.itemCount, 0);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const clearResponse = await request(app)
      .delete("/api/cart")
      .set(authHeader(body.accessToken))
      .expect(200);

    assert.equal(clearResponse.body.itemCount, 0);
  });

  it("rejects unpublished products and insufficient stock", async () => {
    const draft = await seedDraftProduct();
    const lowStock = await seedPublishedProduct();
    lowStock.stock = 1;
    await lowStock.save();
    const { body } = await registerCustomer(app);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: draft._id.toString(), quantity: 1 })
      .expect(404);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: lowStock._id.toString(), quantity: 5 })
      .expect(400);
  });

  it("returns order detail and allows admin status updates", async () => {
    const product = await seedPublishedProduct();
    const customer = await registerCustomer(app);
    await verifyCustomerEmail(app, customer.body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(customer.body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const orderResponse = await request(app)
      .post("/api/orders")
      .set(authHeader(customer.body.accessToken))
      .send({
        shippingAddress: {
          name: "Test Customer",
          line1: "123 Test Street",
          city: "Austin",
          country: "United States",
        },
      })
      .expect(201);

    const orderId = orderResponse.body.id;

    const detailResponse = await request(app)
      .get(`/api/orders/${orderId}`)
      .set(authHeader(customer.body.accessToken))
      .expect(200);

    assert.equal(detailResponse.body.id, orderId);
    assert.equal(detailResponse.body.status, "pending");

    const admin = await registerAdmin(app);

    const statusResponse = await request(app)
      .patch(`/api/orders/${orderId}`)
      .set(authHeader(admin.body.accessToken))
      .send({ status: "processing" })
      .expect(200);

    assert.equal(statusResponse.body.status, "processing");
  });

  it("forbids customers from updating order status", async () => {
    const product = await seedPublishedProduct();
    const customer = await registerCustomer(app);
    await verifyCustomerEmail(app, customer.body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(customer.body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const orderResponse = await request(app)
      .post("/api/orders")
      .set(authHeader(customer.body.accessToken))
      .send({})
      .expect(201);

    await request(app)
      .patch(`/api/orders/${orderResponse.body.id}`)
      .set(authHeader(customer.body.accessToken))
      .send({ status: "processing" })
      .expect(403);
  });

  it("rejects cart quantity above available stock", async () => {
    const product = await seedPublishedProduct();
    product.stock = 2;
    await product.save();
    const { body } = await registerCustomer(app);

    const addResponse = await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const itemId = addResponse.body.items[0].id;

    await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set(authHeader(body.accessToken))
      .send({ quantity: 5 })
      .expect(400);
  });

  it("rejects order placement for unverified customers", async () => {
    const product = await seedPublishedProduct();
    const { body } = await registerCustomer(app);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    await request(app)
      .post("/api/orders")
      .set(authHeader(body.accessToken))
      .send({})
      .expect(403);
  });

  it("restores stock when an order is cancelled", async () => {
    const product = await seedPublishedProduct();
    product.stock = 5;
    await product.save();

    const customer = await registerCustomer(app);
    await verifyCustomerEmail(app, customer.body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(customer.body.accessToken))
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);

    const orderResponse = await request(app)
      .post("/api/orders")
      .set(authHeader(customer.body.accessToken))
      .send({})
      .expect(201);

    const admin = await registerAdmin(app);

    await request(app)
      .patch(`/api/orders/${orderResponse.body.id}`)
      .set(authHeader(admin.body.accessToken))
      .send({ status: "cancelled" })
      .expect(200);

    const updatedProduct = await Product.findById(product._id);
    assert.equal(updatedProduct?.stock, 5);
  });

  it("removes deleted products from cart on GET", async () => {
    const product = await seedPublishedProduct();
    const customer = await registerCustomer(app);
    await verifyCustomerEmail(app, customer.body.accessToken);

    await request(app)
      .post("/api/cart/items")
      .set(authHeader(customer.body.accessToken))
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);

    const admin = await registerAdmin(app);
    await request(app)
      .delete(`/api/products/${product._id.toString()}`)
      .set(authHeader(admin.body.accessToken))
      .expect(204);

    const cartResponse = await request(app)
      .get("/api/cart")
      .set(authHeader(customer.body.accessToken))
      .expect(200);

    assert.equal(cartResponse.body.items.length, 0);
    assert.equal(cartResponse.body.itemCount, 0);
  });
});
