"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { buildShopCatalogHref, type ShopCatalogQuery } from "@/lib/shop-query";

export function useShopCatalogNavigation(initialQuery: ShopCatalogQuery) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const pushCatalog = useCallback(
    (nextQuery: ShopCatalogQuery) => {
      startTransition(() => {
        router.push(buildShopCatalogHref(nextQuery));
      });
    },
    [router]
  );

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

      pushCatalog(nextQuery);
    },
    [initialQuery, pushCatalog]
  );

  const clearFilters = useCallback(() => {
    pushCatalog({
      page: 1,
      limit: initialQuery.limit,
    });
  }, [initialQuery.limit, pushCatalog]);

  return { navigate, clearFilters, isPending };
}
