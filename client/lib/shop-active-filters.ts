import {
  sortApiValueToLabel,
  type ShopCatalogQuery,
} from "@/lib/shop-query";
import type { ShopCatalogFilters } from "@/types/shop-catalog";

export type ShopActiveFilterChip = {
  key: string;
  label: string;
  removePatch: Partial<ShopCatalogQuery>;
};

export function formatShopPriceFilterLabel(
  minPrice?: number,
  maxPrice?: number
): string | null {
  if (minPrice === undefined && maxPrice === undefined) {
    return null;
  }
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `$${minPrice} to $${maxPrice}`;
  }
  if (minPrice !== undefined) {
    return `$${minPrice} and above`;
  }
  return `Up to $${maxPrice}`;
}

export function buildShopActiveFilterChips(
  catalogQuery: ShopCatalogQuery,
  catalogFilters: ShopCatalogFilters,
  options: { showBrandFilter?: boolean } = {}
): ShopActiveFilterChip[] {
  const { showBrandFilter = true } = options;
  const chips: ShopActiveFilterChip[] = [];

  if (catalogQuery.search?.trim()) {
    chips.push({
      key: "search",
      label: `Search: ${catalogQuery.search.trim()}`,
      removePatch: { search: undefined },
    });
  }

  if (catalogQuery.categoryId) {
    const category = catalogFilters.categories.find(
      (item) => item.id === catalogQuery.categoryId
    );
    chips.push({
      key: "category",
      label: category?.name ?? "Category",
      removePatch: { categoryId: undefined },
    });
  }

  if (showBrandFilter && catalogQuery.brandId) {
    const brand = catalogFilters.brands.find(
      (item) => item.id === catalogQuery.brandId
    );
    chips.push({
      key: "brand",
      label: brand?.name ?? "Brand",
      removePatch: { brandId: undefined },
    });
  }

  const priceLabel = formatShopPriceFilterLabel(
    catalogQuery.minPrice,
    catalogQuery.maxPrice
  );
  if (priceLabel) {
    chips.push({
      key: "price",
      label: priceLabel,
      removePatch: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (catalogQuery.sort && catalogQuery.sort !== "newest") {
    chips.push({
      key: "sort",
      label: sortApiValueToLabel(catalogQuery.sort),
      removePatch: { sort: undefined },
    });
  }

  return chips;
}

export type ShopEmptyStateCopy = {
  title: string;
  description: string;
  useSearchIcon: boolean;
  /** One-tap fix when a single filter is likely blocking results */
  loosenAction?: { label: string; patch: Partial<ShopCatalogQuery> };
};

export function getShopEmptyStateCopy(
  catalogQuery: ShopCatalogQuery | undefined,
  catalogFilters: ShopCatalogFilters | undefined,
  options: { showBrandFilter?: boolean } = {}
): ShopEmptyStateCopy {
  if (!catalogQuery) {
    return {
      title: "No products found",
      description:
        "Nothing matches your filters right now. Clear filters or change your selection to see more items.",
      useSearchIcon: false,
    };
  }

  const chips = catalogFilters
    ? buildShopActiveFilterChips(catalogQuery, catalogFilters, options)
    : [];
  const filterCount = chips.length;

  const category = catalogQuery.categoryId
    ? catalogFilters?.categories.find(
        (item) => item.id === catalogQuery.categoryId
      )
    : undefined;
  const brand = catalogQuery.brandId
    ? catalogFilters?.brands.find((item) => item.id === catalogQuery.brandId)
    : undefined;
  const searchTerm = catalogQuery.search?.trim();
  const priceLabel = formatShopPriceFilterLabel(
    catalogQuery.minPrice,
    catalogQuery.maxPrice
  );

  if (searchTerm) {
    if (filterCount > 1) {
      return {
        title: `No results for “${searchTerm}”`,
        description:
          "Your search didn't match anything with the filters below. Remove a filter or try a shorter search term.",
        useSearchIcon: true,
        loosenAction: {
          label: "Search without filters",
          patch: {
            categoryId: undefined,
            brandId: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            sort: undefined,
          },
        },
      };
    }
    return {
      title: "No matching products",
      description: `We couldn't find anything for “${searchTerm}”. Check the spelling, try a shorter term, or browse the full catalog.`,
      useSearchIcon: true,
    };
  }

  if (category && brand) {
    if ((category.productCount ?? 0) === 0) {
      return {
        title: "No products match these filters",
        description: `${category.name} has no published products yet, so combining it with ${brand.name} won't show results. Remove a filter below or switch category.`,
        useSearchIcon: false,
        loosenAction: {
          label: `Remove ${brand.name}`,
          patch: { brandId: undefined },
        },
      };
    }
    return {
      title: `No ${brand.name} in ${category.name}`,
      description:
        "This brand isn't listed in that category. Remove the brand filter to see everything in the category, or clear filters to browse the full shop.",
      useSearchIcon: false,
      loosenAction: {
        label: `Show all ${category.name}`,
        patch: { brandId: undefined },
      },
    };
  }

  if (category) {
    if ((category.productCount ?? 0) === 0) {
      return {
        title: `Nothing in ${category.name} yet`,
        description:
          "This category doesn't have published products right now. Pick another category below or view the full shop.",
        useSearchIcon: false,
        loosenAction: {
          label: `Remove ${category.name}`,
          patch: { categoryId: undefined },
        },
      };
    }
    if (filterCount > 1) {
      return {
        title: `No products in ${category.name}`,
        description:
          "Something else in your filters is narrowing results to zero. Remove one of the filters below or clear them all.",
        useSearchIcon: false,
      };
    }
    return {
      title: `No products in ${category.name}`,
      description:
        "Try clearing price or sort filters, or browse the full catalog.",
      useSearchIcon: false,
    };
  }

  if (brand) {
    if (filterCount > 1) {
      return {
        title: `No products from ${brand.name}`,
        description:
          "Combined with your other filters, nothing is available. Remove a filter below to widen results.",
        useSearchIcon: false,
        loosenAction: {
          label: `Remove ${brand.name}`,
          patch: { brandId: undefined },
        },
      };
    }
    return {
      title: `No products from ${brand.name}`,
      description:
        "Try removing other filters or browse all brands on the shop page.",
      useSearchIcon: false,
    };
  }

  if (priceLabel) {
    return {
      title: "No products in this price range",
      description: `Nothing is listed between ${priceLabel}. Widen the range or clear filters to see more.`,
      useSearchIcon: false,
      loosenAction: {
        label: "Remove price filter",
        patch: { minPrice: undefined, maxPrice: undefined },
      },
    };
  }

  if (catalogQuery.sort && catalogQuery.sort !== "newest") {
    return {
      title: "No products found",
      description: `No items match with ${sortApiValueToLabel(catalogQuery.sort).toLowerCase()}. Clear filters or change sort to see more.`,
      useSearchIcon: false,
      loosenAction: {
        label: "Reset sort",
        patch: { sort: undefined },
      },
    };
  }

  if (filterCount > 0) {
    return {
      title: "No products match your filters",
      description:
        "Nothing fits every filter you've applied. Remove one below or start fresh.",
      useSearchIcon: false,
    };
  }

  return {
    title: "No products found",
    description:
      "Nothing is available to show right now. Check back later or view the full catalog.",
    useSearchIcon: false,
  };
}
