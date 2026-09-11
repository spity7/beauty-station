"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  buildShopCatalogHref,
  type ShopCatalogQuery,
} from "@/lib/shop-query";

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
        patch.maxPrice !== undefined
      ) {
        nextQuery.page = 1;
      }

      router.push(buildShopCatalogHref(nextQuery));
    },
    [initialQuery, router]
  );

  const clearFilters = useCallback(() => {
    router.push("/shop");
  }, [router]);

  return { navigate, clearFilters };
}
