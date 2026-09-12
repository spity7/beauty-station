import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createShopCatalogQuery } from "../lib/shop-query.js";
import { buildShopPageMetadata } from "../lib/shop-metadata.js";

describe("shop page helpers", () => {
  it("buildShopPageMetadata includes search in title", () => {
    const metadata = buildShopPageMetadata(
      {
        id: "test",
        name: "Test Shop",
        seo: { title: "Test", description: "Desc" },
      } as import("@platform/shared").SiteConfig,
      { search: "serum" },
      { categories: [], brands: [] }
    );
    assert.match(String(metadata.title), /serum/i);
  });

  it("createShopCatalogQuery provides defaults for header links", () => {
    const query = createShopCatalogQuery({ search: "lipstick" });
    assert.equal(query.limit, 15);
    assert.equal(query.search, "lipstick");
  });
});
