import Banner from "@/components/products/Banner";
import Breadcrumb from "@/components/products/Breadcrumb";
import Categories from "@/components/products/Categories";
import ShopDefault from "@/components/products/ShopDefault";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { mapProductDtosToStorefront } from "@/lib/mappers/product";
import {
  parseShopCatalogQuery,
  shopCatalogQueryToProductParams,
} from "@/lib/shop-query";
import {
  loadShopCatalogFilters,
  resolveShopInitialFilters,
} from "@/lib/shop-catalog";
import { getStorefrontSiteConfig } from "@/lib/site";
import { fetchProducts } from "@platform/api-client";
import type { Metadata } from "next";
import type { Product } from "@/types/product";
import type { ShopCatalogPagination } from "@/types/shop-catalog";

const site = getStorefrontSiteConfig();

export const metadata: Metadata = {
  title: `Shop | ${site.seo.title}`,
  description: site.seo.description,
};

type ShopProductLoadResult = {
  catalogLoadError?: boolean;
  catalogPagination?: ShopCatalogPagination;
  products: Product[];
};

async function loadShopProducts(
  query: ReturnType<typeof parseShopCatalogQuery>
): Promise<ShopProductLoadResult> {
  try {
    const response = await fetchProducts(
      shopCatalogQueryToProductParams(query)
    );
    return {
      products: mapProductDtosToStorefront(response.data),
      catalogPagination: {
        limit: response.limit,
        page: response.page,
        total: response.total,
      },
    };
  } catch {
    return {
      products: [],
      catalogLoadError: true,
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const catalogQuery = parseShopCatalogQuery(resolvedSearchParams);
  const [{ products, catalogPagination, catalogLoadError }, catalogFilters] =
    await Promise.all([
      loadShopProducts(catalogQuery),
      loadShopCatalogFilters(),
    ]);
  const initialFilters = resolveShopInitialFilters(
    catalogFilters,
    catalogQuery
  );

  return (
    <StorefrontChrome>
      <Breadcrumb title="Shop" />
      <Banner />
      <Categories />
      <div className="rbt-component-area ptb--32 ptb_sm--12">
        <div className="container">
          <div className="rbt-separator rbt-separator-gray200" />
        </div>
      </div>
      <ShopDefault
        cardVariant="standard"
        catalogFilters={catalogFilters}
        catalogLoadError={catalogLoadError}
        catalogPagination={catalogPagination}
        catalogQuery={catalogQuery}
        detailsPageUrl="/product"
        initialFilters={initialFilters}
        products={products}
      />
    </StorefrontChrome>
  );
}
