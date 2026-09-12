import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildShopCatalogHref,
  createShopCatalogQuery,
  DEFAULT_SHOP_CATALOG_LIMIT,
  parseShopCatalogQuery,
  shopCatalogQueryToProductParams,
} from "../lib/shop-query.js";

describe("shop-query", () => {
  it("parses limit from URL and defaults to 15", () => {
    const defaults = parseShopCatalogQuery({});
    assert.equal(defaults.page, 1);
    assert.equal(defaults.limit, DEFAULT_SHOP_CATALOG_LIMIT);
    assert.equal(parseShopCatalogQuery({ limit: "9" }).limit, 9);
  });

  it("includes limit in href when not default", () => {
    assert.equal(
      buildShopCatalogHref(createShopCatalogQuery({ limit: 9 })),
      "/shop?limit=9"
    );
  });

  it("passes limit through to product list params", () => {
    assert.equal(
      shopCatalogQueryToProductParams(
        createShopCatalogQuery({ limit: 6, page: 2 })
      ).limit,
      6
    );
  });

  it("preserves zero-result query shape for product fetch", () => {
    const query = parseShopCatalogQuery({
      search: "missing-product",
      categoryId: "abc",
    });
    const params = shopCatalogQueryToProductParams(query);
    assert.equal(params.search, "missing-product");
    assert.equal(params.categoryId, "abc");
    assert.equal(params.limit, DEFAULT_SHOP_CATALOG_LIMIT);
  });
});
