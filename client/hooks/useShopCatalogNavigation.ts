"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { buildShopCatalogHref, type ShopCatalogQuery } from "@/lib/shop-query";

export function useShopCatalogNavigation(initialQuery: ShopCatalogQuery) {
  const router = useRouter();

  const navigate = useCallback(
    (patch: Partial<ShopCatalogQuery>) => {
      const nextQuery: ShopCatalogQuery = {
        ...initialQuery,
        ...patch,
      };

      if (
        patch.categoryId !== undefined ||
        patch.brandId !== undefined ||
        patch.search !== undefined ||
        patch.sort !== undefined ||
        patch.minPrice !== undefined ||
        patch.maxPrice !== undefined ||
        patch.limit !== undefined
      ) {
        nextQuery.page = 1;
      }

      router.push(buildShopCatalogHref(nextQuery));
    },
    [initialQuery, router]
  );

  const clearFilters = useCallback(() => {
    router.push(
      buildShopCatalogHref({
        page: 1,
        limit: initialQuery.limit,
      })
    );
  }, [initialQuery.limit, router]);

  return { navigate, clearFilters };
}
