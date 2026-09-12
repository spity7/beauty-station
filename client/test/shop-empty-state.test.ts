import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getShopEmptyStateCopy } from "../lib/shop-active-filters.js";
import { createShopCatalogQuery } from "../lib/shop-query.js";

describe("shop empty state copy", () => {
  it("describes empty categories with no published products", () => {
    const copy = getShopEmptyStateCopy(
      createShopCatalogQuery({ categoryId: "cat-face" }),
      {
        categories: [{ id: "cat-face", name: "Face Wash", productCount: 0 }],
        brands: [],
      }
    );
    assert.match(copy.title, /Face Wash/i);
    assert.match(copy.description, /doesn't have published products/i);
  });

  it("describes failed search terms", () => {
    const copy = getShopEmptyStateCopy(
      createShopCatalogQuery({ search: "repair" }),
      { categories: [], brands: [] }
    );
    assert.equal(copy.useSearchIcon, true);
    assert.match(copy.description, /repair/);
  });

  it("explains category and brand combined with empty category", () => {
    const copy = getShopEmptyStateCopy(
      createShopCatalogQuery({
        categoryId: "cat-face",
        brandId: "brand-glow",
      }),
      {
        categories: [{ id: "cat-face", name: "Face Wash", productCount: 0 }],
        brands: [{ id: "brand-glow", name: "Glow Lab" }],
      }
    );
    assert.match(copy.title, /No products match these filters/i);
    assert.match(copy.description, /Face Wash/i);
    assert.match(copy.description, /Glow Lab/i);
    assert.equal(copy.loosenAction?.label, "Remove Glow Lab");
  });
});
