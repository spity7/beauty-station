"use client";

import ProductCard10 from "@/components/product-cards/ProductCard10";
import { StorefrontCatalogEmptyState } from "@/components/catalog/StorefrontCatalogEmptyState";
import { mapProductDtosToStorefront } from "@/lib/mappers/product";
import { fetchPublishedProducts } from "@platform/api-client";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";

export default function StorefrontSearchTrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchPublishedProducts(4)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setProducts(mapProductDtosToStorefront(response.data));
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <p className="mb--0 rbt-text-color-body">Loading featured products…</p>
    );
  }

  if (products.length === 0) {
    return (
      <StorefrontCatalogEmptyState message="No published products to highlight yet." />
    );
  }

  return (
    <div className="row row--12 mt_dec--24">
      {products.map((product) => (
        <div
          key={String(product.id)}
          className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-6 mt--24 mt_sm--16"
        >
          <ProductCard10 detailsPageUrl="/product" product={product} />
        </div>
      ))}
    </div>
  );
}
