import Breadcrumb from "@/components/products/Breadcrumb";
import Categories from "@/components/products/Categories";
import ShopDefault from "@/components/products/ShopDefault";
import ShopProductionBanner from "@/components/products/ShopProductionBanner";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { parseShopCatalogQuery } from "@/lib/shop-query";
import {
  loadShopCatalogFiltersForPage,
  loadShopProductsForPage,
} from "@/lib/shop-catalog-load";
import { buildShopPageMetadata } from "@/lib/shop-metadata";
import { resolveShopInitialFilters } from "@/lib/shop-catalog";
import { getStorefrontSiteConfig } from "@/lib/site";
import type { Metadata } from "next";

const site = getStorefrontSiteConfig();

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { filters } = await loadShopCatalogFiltersForPage();
  return buildShopPageMetadata(site, resolvedSearchParams, filters);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const catalogQuery = parseShopCatalogQuery(resolvedSearchParams);
  const [
    { products, catalogPagination, productsLoadError },
    { filters: catalogFilters, filtersLoadError },
  ] = await Promise.all([
    loadShopProductsForPage(catalogQuery),
    loadShopCatalogFiltersForPage(),
  ]);
  const initialFilters = resolveShopInitialFilters(
    catalogFilters,
    catalogQuery
  );
  const showBrandFilter = site.features.brands !== false;

  return (
    <StorefrontChrome>
      <Breadcrumb title="Shop" />
      <ShopProductionBanner />
      <Categories productionStrip />
      <div className="rbt-component-area ptb--32 ptb_sm--12">
        <div className="container">
          <div className="rbt-separator rbt-separator-gray200" />
        </div>
      </div>
      <ShopDefault
        cardVariant="standard"
        catalogFilters={catalogFilters}
        catalogPagination={catalogPagination}
        catalogQuery={catalogQuery}
        detailsPageUrl="/product"
        filtersLoadError={filtersLoadError}
        initialFilters={initialFilters}
        products={products ?? []}
        productsLoadError={productsLoadError}
        showBrandFilter={showBrandFilter}
      />
    </StorefrontChrome>
  );
}
