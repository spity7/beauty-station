import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveShopBrandAvatarClass } from "../lib/shop-catalog.js";

describe("shop brand filter", () => {
  it("maps success tile classes to muted avatar variant", () => {
    assert.equal(
      resolveShopBrandAvatarClass("bg-success-50 text-success-600"),
      "rbt-shop-brand-avatar rbt-shop-brand-avatar--muted"
    );
    assert.equal(
      resolveShopBrandAvatarClass("bg-brand-50 text-brand-600"),
      "rbt-shop-brand-avatar"
    );
  });
});
