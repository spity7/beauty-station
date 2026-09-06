import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getManagedCatalogObjectPath } from "../src/utils/managed-catalog-path.js";

describe("getManagedCatalogObjectPath", () => {
  const bucketName = "beauty_station";

  it("returns the object path for catalog images in the configured bucket", () => {
    const imageUrl = `https://storage.googleapis.com/${bucketName}/products/1788207250218-photo.webp`;

    assert.equal(
      getManagedCatalogObjectPath(imageUrl, bucketName),
      "products/1788207250218-photo.webp"
    );
  });

  it("accepts categories and brands folders", () => {
    assert.equal(
      getManagedCatalogObjectPath(
        `https://storage.googleapis.com/${bucketName}/categories/thumb.webp`,
        bucketName
      ),
      "categories/thumb.webp"
    );
    assert.equal(
      getManagedCatalogObjectPath(
        `https://storage.googleapis.com/${bucketName}/brands/logo.webp`,
        bucketName
      ),
      "brands/logo.webp"
    );
  });

  it("returns null for external image URLs", () => {
    assert.equal(
      getManagedCatalogObjectPath(
        "https://example.com/product.jpg",
        bucketName
      ),
      null
    );
  });

  it("returns null for objects in another bucket", () => {
    assert.equal(
      getManagedCatalogObjectPath(
        "https://storage.googleapis.com/other-bucket/products/image.webp",
        bucketName
      ),
      null
    );
  });

  it("returns null for unsupported folders", () => {
    assert.equal(
      getManagedCatalogObjectPath(
        `https://storage.googleapis.com/${bucketName}/avatars/user.webp`,
        bucketName
      ),
      null
    );
  });
});
