import Banner from "@/components/products/Banner";
import Breadcrumb from "@/components/products/Breadcrumb";
import Categories from "@/components/products/Categories";
import ShopDefault from "@/components/products/ShopDefault";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { cosmeticProducts } from "@/data/products/beauty";
import { mapProductDtosToStorefront } from "@/lib/mappers/product";
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
const SHOP_PAGE_SIZE = 15;

export const metadata: Metadata = {
  title: `Shop | ${site.seo.title}`,
  description: site.seo.description,
};

type ShopProductLoadResult = {
  catalogPagination?: ShopCatalogPagination;
  products: Product[];
};

async function loadShopProducts(params: {
  brandId?: string;
  categoryId?: string;
  page: number;
}): Promise<ShopProductLoadResult> {
  try {
    const response = await fetchProducts({
      brandId: params.brandId,
      categoryId: params.categoryId,
      limit: SHOP_PAGE_SIZE,
      page: params.page,
    });
    if (response.data.length > 0 || response.total > 0) {
      return {
        products: mapProductDtosToStorefront(response.data),
        catalogPagination: {
          limit: response.limit,
          page: response.page,
          total: response.total,
        },
      };
    }
  } catch {
    // fall through to static data when API is unavailable
  }

  return {
    products: cosmeticProducts,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    brandId?: string;
    categoryId?: string;
    page?: string;
  }>;
}) {
  const { brandId, categoryId, page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const [{ products, catalogPagination }, catalogFilters] = await Promise.all([
    loadShopProducts({ brandId, categoryId, page }),
    loadShopCatalogFilters(),
  ]);
  const initialFilters = resolveShopInitialFilters(catalogFilters, {
    brandId,
    categoryId,
  });

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
        catalogPagination={catalogPagination}
        detailsPageUrl="/product"
        initialFilters={initialFilters}
        products={products}
      />
    </StorefrontChrome>
  );
}
