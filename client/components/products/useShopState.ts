"use client";

import { useEffect, useMemo, useReducer } from "react";
import { initialState, reducer } from "../reducer/filterReducer";
import { electronicsCardData } from "@/data/products/electronics";
import type { FilterState, Product } from "@/types";

type LoaderType = "pagination" | "button";

type UseShopStateOptions = {
  column: number;
  defaultBrands?: string[];
  defaultCategories?: string[];
  loaderType?: LoaderType | string;
  defaultSortingOption?: string;
  defaultTags?: string[];
  itemPerPage?: number;
  products?: Product[];
  serverPagination?: boolean;
};

export function useShopState({
  column,
  defaultBrands = [],
  defaultCategories = [],
  loaderType = "pagination",
  defaultSortingOption = "Sort by (Default)",
  defaultTags = [],
  itemPerPage = 0,
  products,
  serverPagination = false,
}: UseShopStateOptions) {
  const sourceProducts = (
    products !== undefined ? products : electronicsCardData
  ) as Product[];
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    brands: defaultBrands,
    categories: defaultCategories,
    filtered: sourceProducts,
    sorted: sourceProducts,
    itemPerPage: itemPerPage
      ? itemPerPage
      : column >= 4
        ? column * 3
        : column * 5,
    tags: defaultTags,
    sortingOption: defaultSortingOption,
  });

  useEffect(() => {
    if (serverPagination) {
      dispatch({ type: "SET_SERVER_PRODUCTS", payload: sourceProducts });
      return;
    }

    dispatch({ type: "FILTER_PRODUCTS", payload: sourceProducts });
  }, [
    state.brands,
    state.categories,
    state.colors,
    state.size,
    state.activeFilterOnSale,
    state.activeFilterInStock,
    state.services,
    state.ratings,
    state.price,
    state.tags,
    sourceProducts,
    serverPagination,
  ]);

  useEffect(() => {
    if (serverPagination) {
      return;
    }

    dispatch({ type: "SORT_PRODUCTS" });
  }, [serverPagination, state.sortingOption, state.filtered]);

  const isLoadMore = loaderType === "button";

  const visibleProducts = useMemo(() => {
    if (serverPagination) {
      return state.sorted;
    }
    if (isLoadMore) {
      return state.sorted.slice(0, state.currentPage * state.itemPerPage);
    }
    return state.sorted.slice(
      (state.currentPage - 1) * state.itemPerPage,
      state.currentPage * state.itemPerPage
    );
  }, [
    isLoadMore,
    serverPagination,
    state.currentPage,
    state.itemPerPage,
    state.sorted,
  ]);

  function getFilterCount(filterFunction: (product: Product) => boolean) {
    return sourceProducts.filter((product) => filterFunction(product)).length;
  }

  return {
    state: state as FilterState,
    dispatch,
    visibleProducts,
    getFilterCount: getFilterCount as (
      fn: (product: Product) => boolean
    ) => number,
    isLoadMore,
  };
}
