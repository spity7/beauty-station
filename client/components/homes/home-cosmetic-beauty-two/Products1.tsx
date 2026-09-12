import ProductCard5 from "@/components/product-cards/ProductCard5";
import { StorefrontCatalogEmptyState } from "@/components/catalog/StorefrontCatalogEmptyState";
import { fetchPublishedProducts } from "@platform/api-client";
import { mapProductDtosToStorefront } from "@/lib/mappers/product";
import type { Product } from "@/types/product";
import Link from "next/link";

async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetchPublishedProducts(8);
    if (response.data.length === 0) {
      return [];
    }
    return mapProductDtosToStorefront(response.data);
  } catch {
    return [];
  }
}

export default async function Products1() {
  const products = await loadProducts();

  return (
    <div className="rbt-component-area rbt-section-gapTop">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex justify-content-between flex-row align-items-end mb--8 flex-wrap rbt-gap--16">
            <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
              <h4 className="rbt-title rbt-scroll-trigger fade_in animation-order-1">
                Our latest <span className="rbt-bold--text">Arrivals</span>
              </h4>
            </div>
            <Link
              className="rbt-btn rbt-btn-secondary rbt-btn-sm-2 rbt-scroll-trigger fade_in animation-order-2"
              href={`/shop`}
            >
              <span className="btn-text">View All products</span>
              <span className="btn-icon ml--4">
                <i className="fa-sharp fa-solid fa-arrow-up-right-from-square" />
              </span>
            </Link>
          </div>
        </div>
        {products.length === 0 ? (
          <StorefrontCatalogEmptyState message="No products have been published yet." />
        ) : (
          <div className="row row--12">
            {products.map((product, i) => (
              <div
                key={String(product.id)}
                className="col-lg-3 col-xl-3 col-xxl-3 col-md-6 col-sm-6 col-6 mt--24"
              >
                <ProductCard5
                  detailsPageUrl="/product"
                  contentBgClass="rbt-bg-color-gray-light"
                  product={product}
                  animationOrder={i + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
