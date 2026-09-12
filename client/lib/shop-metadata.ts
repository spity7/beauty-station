import type { Metadata } from "next";
import { parseShopCatalogQuery, sortApiValueToLabel } from "@/lib/shop-query";
import type { ShopCatalogFilters } from "@/types/shop-catalog";
import type { SiteConfig } from "@platform/shared";

export function buildShopPageMetadata(
  site: SiteConfig,
  searchParams: Record<string, string | undefined>,
  catalogFilters?: ShopCatalogFilters
): Metadata {
  const query = parseShopCatalogQuery(searchParams);
  const baseTitle = `Shop | ${site.seo.title}`;

  const parts: string[] = [];

  if (query.search) {
    parts.push(`Search “${query.search}”`);
  }

  if (query.categoryId && catalogFilters) {
    const category = catalogFilters.categories.find(
      (item) => item.id === query.categoryId
    );
    if (category) {
      parts.push(category.name);
    }
  }

  if (query.brandId && catalogFilters) {
    const brand = catalogFilters.brands.find(
      (item) => item.id === query.brandId
    );
    if (brand) {
      parts.push(brand.name);
    }
  }

  if (query.sort && query.sort !== "newest") {
    parts.push(sortApiValueToLabel(query.sort));
  }

  if (parts.length === 0) {
    return {
      title: baseTitle,
      description: site.seo.description,
    };
  }

  return {
    title: `${parts.join(" · ")} | ${baseTitle}`,
    description: `Browse ${parts.join(", ")} at ${site.name}.`,
  };
}
