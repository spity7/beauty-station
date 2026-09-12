import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProductListFilter,
  escapeRegexSearchTerm,
} from "../src/utils/product-list-filter.js";

describe("product-list-filter search", () => {
  it("escapes regex metacharacters in search terms", () => {
    assert.equal(escapeRegexSearchTerm("a+b"), "a\\+b");
    assert.equal(escapeRegexSearchTerm("repair"), "repair");
  });

  it("uses case-insensitive substring match on catalog fields", () => {
    const filter = buildProductListFilter(
      { page: 1, limit: 20, search: "repair" },
      false
    );
    assert.equal(filter.status, "published");
    assert.ok(Array.isArray(filter.$or));
    const or = filter.$or as { name?: { $regex: string; $options: string } }[];
    assert.equal(or[0]?.name?.$regex, "repair");
    assert.equal(or[0]?.name?.$options, "i");
  });
});
