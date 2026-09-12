"use client";
import { WaveFatIcon } from "../svg-icons";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useShopCatalogNavigation } from "@/hooks/useShopCatalogNavigation";
import type { ShopProductsLoadError } from "@/lib/shop-catalog-load";
import {
  createShopCatalogQuery,
  SHOP_CATALOG_PAGE_SIZE_OPTIONS,
  sortApiValueToLabel,
  sortLabelToApiValue,
  type ShopCatalogQuery,
} from "@/lib/shop-query";

import {
  clearAllFilters,
  setCurrentPage,
  setItemPerPage,
  setSorting,
  toggleTag,
} from "../reducer/filterActions";
import ProductCard9 from "../product-cards/ProductCard9";
import ProductCard8 from "../product-cards/ProductCard8";
import FilterByTag from "./filterComponents/FilterByTag";
import DropdownSelect from "../common/select/DropdownSelect";
import ShopPagination from "./ShopPagination";
import ShopServerPagination from "./ShopServerPagination";
import FilterMeta from "./FilterMeta";
import ShopServerFilterMeta from "./ShopServerFilterMeta";
import Sidebar from "./Sidebar";
import LayoutHandler from "./LayoutHandler";
import ShopProductGridSkeleton from "./ShopProductGridSkeleton";
import ShopCatalogEmptyState from "./ShopCatalogEmptyState";
import SidebarScrollable from "./SidebarScrollable";
import { Product } from "@/types/product";

import { useShopState } from "./useShopState";
import type {
  ShopCatalogFilters,
  ShopCatalogPagination,
  ShopInitialFilters,
} from "@/types/shop-catalog";
import ProductCard16 from "../product-cards/ProductCard16";
import ProductCard1 from "../product-cards/ProductCard1";
import ProductCard10 from "../product-cards/ProductCard10";
import ProductCard5 from "../product-cards/ProductCard5";
import ProductCard4 from "../product-cards/ProductCard4";
import ProductSmallCard from "../product-cards/ProductCardElectronicsList";
import ProductCard22 from "../product-cards/ProductCard22";

const SHOP_SEARCH_DEBOUNCE_MS = 400;

type CardVariant =
  | "default"
  | "scale-hover"
  | "hover-add-to-cart"
  | "standard"
  | "icons-hover"
  | "button-on-image"
  | "button-on-image-signin"
  | "additional-info"
  | "button-visible-hover"
  | "shadow-hover"
  | "small-variation";

export default function ShopDefault({
  rightSidebar = false,
  stickyTop = false,
  sidebarScrollAble = false,
  loaderType = "pagination",
  column = 3,
  containerFull = false,
  wider = false,
  defaultFilterTag = [] as string[],
  itemPerPage = 0,
  showBestSellerBadge = false,
  countdownStyle = "default",
  showQuantityBadge = false,
  cardVariant = "default",
  catalogFilters,
  catalogPagination,
  catalogQuery,
  filtersLoadError = false,
  products,
  productsLoadError,
  hasCardBorder = false,
  detailsPageUrl = "/product-single-default",
  initialFilters,
  showBrandFilter = true,
}: {
  rightSidebar?: boolean;
  stickyTop?: boolean;
  sidebarScrollAble?: boolean;
  loaderType?: "pagination" | "button";
  column?: number;
  containerFull?: boolean;
  wider?: boolean;
  defaultFilterTag?: string[];
  itemPerPage?: number;
  showBestSellerBadge?: boolean;
  countdownStyle?: "default" | "compact";
  showQuantityBadge?: boolean;
  cardVariant?: CardVariant;
  catalogFilters?: ShopCatalogFilters;
  catalogPagination?: ShopCatalogPagination;
  catalogQuery?: ShopCatalogQuery;
  filtersLoadError?: boolean;
  products?: Product[];
  productsLoadError?: ShopProductsLoadError;
  hasCardBorder?: boolean;
  detailsPageUrl?: string;
  initialFilters?: ShopInitialFilters;
  showBrandFilter?: boolean;
}) {
  const router = useRouter();
  const isServerCatalog = Boolean(catalogQuery);
  const [gridColumn, setGridColumn] = useState<2 | 3 | 4>(
    column === 2 || column === 4 ? column : 3
  );
  const activeColumn = isServerCatalog ? gridColumn : column;
  const resolvedCatalogQuery =
    catalogQuery ?? createShopCatalogQuery({ page: 1 });
  const [searchValue, setSearchValue] = useState(initialFilters?.search ?? "");
  const [showSearchSkeleton, setShowSearchSkeleton] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { navigate, clearFilters, isPending } =
    useShopCatalogNavigation(resolvedCatalogQuery);

  const applySearchNavigation = useMemo(
    () => (query: string) => {
      setShowSearchSkeleton(true);
      navigate({ search: query || undefined });
    },
    [navigate]
  );

  useEffect(() => {
    setSearchValue(catalogQuery?.search ?? "");
    setShowSearchSkeleton(false);
  }, [catalogQuery?.search]);

  useEffect(() => {
    if (!isServerCatalog) {
      return;
    }

    const trimmed = searchValue.trim();
    const currentSearch = catalogQuery?.search ?? "";

    if (trimmed === currentSearch) {
      setShowSearchSkeleton(false);
      return;
    }

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      searchDebounceRef.current = null;
      applySearchNavigation(trimmed);
    }, SHOP_SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [
    applySearchNavigation,
    catalogQuery?.search,
    isServerCatalog,
    searchValue,
  ]);

  const isCatalogLoading = isServerCatalog && (isPending || showSearchSkeleton);
  const skeletonCount =
    catalogPagination?.limit ?? resolvedCatalogQuery.limit ?? 15;

  const pageSizeOptions = useMemo(
    () => SHOP_CATALOG_PAGE_SIZE_OPTIONS.map((size) => `${size} Items`),
    []
  );
  const { state, dispatch, visibleProducts, getFilterCount, isLoadMore } =
    useShopState({
      column: activeColumn,
      defaultBrands: initialFilters?.brandNames ?? [],
      defaultCategories: initialFilters?.categoryNames ?? [],
      defaultSortingOption: sortApiValueToLabel(initialFilters?.sort),
      loaderType,
      defaultTags: defaultFilterTag,
      itemPerPage: catalogPagination?.limit ?? itemPerPage,
      products,
      serverPagination: Boolean(catalogPagination),
    });
  const serverCatalogControls = isServerCatalog
    ? {
        brandId: catalogQuery?.brandId,
        categoryId: catalogQuery?.categoryId,
        minPrice: catalogQuery?.minPrice,
        maxPrice: catalogQuery?.maxPrice,
        onBrandChange: (brandId?: string) => navigate({ brandId }),
        onCategoryChange: (categoryId?: string) => navigate({ categoryId }),
        onPriceChange: (minPrice?: number, maxPrice?: number) =>
          navigate({ minPrice, maxPrice }),
      }
    : undefined;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isServerCatalog) {
      return;
    }
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    applySearchNavigation(searchValue.trim());
  }
  const columnClass = useMemo(() => {
    if (activeColumn <= 4) {
      return `col-xxl-${12 / activeColumn} col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 product-col mt--24 ${containerFull ? "" : "product-four-col"}`;
    } else if (activeColumn == 5) {
      return `col-xl-1-5 col-lg-6 col-md-6 col-6 mt--24 product-five-col`;
    } else if (activeColumn == 6) {
      return `col-xxl-2 col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mt--24`;
    }
    return "col-lg-4 col-md-6 col-sm-6 col-6 product-col";
  }, [activeColumn, containerFull]);

  const shouldShowPricingBadge = useMemo(
    () => activeColumn <= 4,
    [activeColumn]
  );
  const shouldShowTimer = useMemo(() => activeColumn <= 4, [activeColumn]);
  const sidebarColClass = useMemo(() => {
    if (wider) {
      return "col-xxl-2 col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12 mt--24";
    }
    return "col-lg-3 col-md-12 col-sm-12 col-12 mt--24";
  }, [wider]);

  const contentColClass = useMemo(() => {
    if (wider) {
      return "col-xxl-10 col-xl-9 col-lg-8 col-md-12 col-sm-12 col-12 mt--24";
    }
    return "col-lg-9 col-md-12 col-sm-12 col-12 mt--24";
  }, [wider]);

  const hasNoFilteredItems = state.sorted.length === 0;
  const hasMultiplePages = catalogPagination
    ? catalogPagination.total > catalogPagination.limit
    : state.sorted.length > state.itemPerPage;
  const resultTotal = catalogPagination?.total ?? state.sorted.length;
  const fromResult = hasNoFilteredItems
    ? 0
    : catalogPagination
      ? (catalogPagination.page - 1) * catalogPagination.limit + 1
      : (state.currentPage - 1) * state.itemPerPage + 1;
  const toResult = hasNoFilteredItems
    ? 0
    : catalogPagination
      ? Math.min(catalogPagination.page * catalogPagination.limit, resultTotal)
      : Math.min(state.currentPage * state.itemPerPage, state.sorted.length);

  const ProductCardComponent = useMemo(() => {
    switch (cardVariant) {
      case "scale-hover":
        return ProductCard16;
      case "hover-add-to-cart":
        return ProductCard1;
      case "button-on-image":
        return ProductCard5;
      case "button-on-image-signin":
        return ProductCard22;
      case "standard":
        return ProductCard10;
      case "icons-hover":
        return ProductCard8;
      case "button-visible-hover":
        return ProductCard4;
      case "additional-info":
      case "shadow-hover":
        return ProductCard16;
      case "small-variation":
        return ProductSmallCard;
      case "default":
      default:
        return ProductCard9;
    }
  }, [cardVariant]);

  return (
    <div className="rbt-component-area rbt-shop-filter-area rbt-bg-color-white rbt-section-gapBottom">
      <div
        className={`${containerFull ? "rbt-full-width-wrapper" : "container"}`}
      >
        <div
          className={`row row--16 mt_dec--24  ${
            rightSidebar ? "flex-row-reverse" : ""
          } `}
        >
          <div className={sidebarColClass}>
            <aside
              className={`rbt-sidebar has-rbt-fshape ${
                stickyTop ? "sticky-top" : ""
              }`}
            >
              <div className="rbt-sidebar-widget-wrapper rbt-sidebar-bg-one position-relative">
                <div className="rbt-sidebar-top">
                  <h6 className="rbt-sidebar-title">
                    <i className="fa-sharp fa-regular fa-filter-list mr--4" />
                    Filter &amp; Refine
                    <span className="rbt-fshape-right-portion">
                      <WaveFatIcon />
                    </span>
                  </h6>
                </div>
                {sidebarScrollAble ? (
                  <SidebarScrollable
                    catalogFilters={catalogFilters}
                    getFilterCount={getFilterCount}
                    state={state}
                    dispatch={dispatch}
                  />
                ) : (
                  <Sidebar
                    catalogFilters={catalogFilters}
                    getFilterCount={getFilterCount}
                    serverCatalog={serverCatalogControls}
                    showBrandFilter={showBrandFilter}
                    state={state}
                    dispatch={dispatch}
                  />
                )}
              </div>
              {!isServerCatalog ? (
                <div className="rbt-sidebar-widget-wrapper">
                  <div className="rbt-sidebar-widget-img">
                    <a href="#">
                      <Image
                        alt="Sidebar Banner"
                        src="/assets/images/sidebar/sidebar-banner-one.webp"
                        width={628}
                        height={840}
                      />
                    </a>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
          <div className={contentColClass}>
            <div className="row row--12">
              <div className="col-md-12">
                {!isServerCatalog ? (
                  <div className="rbt-shop-tools-wrapper">
                    <div className="rbt-shop-tool-content rbt-shop-filter-tag-wrapper w-100">
                      <h6 className="rbt-shop-tools-title">Fast FIlter :</h6>
                      <div className="rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-rounded rbt-tag-list-var-one">
                        <FilterByTag
                          selectedItems={state.tags}
                          onChange={(value) =>
                            toggleTag(value, dispatch, state.tags)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="rbt-shop-tools-wrapper rbt-shop-tools-wrapper-var-one mt--20">
                  <div className="rbt-shop-tool-content rbt-shop-view-var-wrapper">
                    <h6 className="rbt-shop-tools-title">
                      {isCatalogLoading
                        ? "Updating results…"
                        : `Showing ${fromResult}–${toResult} of ${resultTotal} results`}
                    </h6>
                    <div className="rbt-shop-view-btn-list rbt-tag-list-rounded rbt-shop-view-menu">
                      <LayoutHandler
                        column={activeColumn}
                        mode={isServerCatalog ? "grid-columns" : "demo-routes"}
                        onColumnChange={setGridColumn}
                      />
                    </div>
                  </div>
                  <div className="rbt-shop-tool-content rbt-shop-view-sort-wrapper">
                    <div className="rbt-tools-select-single">
                      <h6 className="rbt-shop-tools-title">Sort :</h6>
                      <div className="rbt-modern-select rbt-shop-view-sort-select-one">
                        <DropdownSelect
                          selected={
                            isServerCatalog
                              ? sortApiValueToLabel(catalogQuery?.sort)
                              : state.sortingOption
                          }
                          onChange={(value) => {
                            if (isServerCatalog) {
                              navigate({
                                sort: sortLabelToApiValue(value),
                              });
                              return;
                            }
                            setSorting(value, dispatch);
                          }}
                        />
                      </div>
                    </div>
                    <div className="rbt-tools-select-single">
                      <h6 className="rbt-shop-tools-title">Show :</h6>
                      <div className="rbt-modern-select rbt-shop-view-sort-select-two">
                        <DropdownSelect
                          selected={`${isServerCatalog ? resolvedCatalogQuery.limit : state.itemPerPage} Items`}
                          options={pageSizeOptions}
                          onChange={(value) => {
                            const nextLimit = Number(value.split(" ")[0]);
                            if (isServerCatalog) {
                              navigate({ limit: nextLimit });
                              return;
                            }
                            setItemPerPage(nextLimit, dispatch);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rbt-shop-tool-content rbt-shop-view-var-wrapper">
                    <form
                      className="rbt-inner-search-field style-one rbt-search-field-rounded"
                      onSubmit={handleSearchSubmit}
                    >
                      <input
                        type="search"
                        placeholder="Search for products"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                      />
                      <button
                        className="rbt-round-btn search-btn"
                        type="submit"
                      >
                        <i className="fa-solid fa-magnifying-glass" />
                      </button>
                    </form>
                  </div>
                </div>
                {isServerCatalog &&
                catalogFilters &&
                !(hasNoFilteredItems && !isCatalogLoading) ? (
                  <div className="rbt-shop-tools-wrapper">
                    <div className="rbt-shop-tool-content rbt-shop-filter-tag-wrapper">
                      <ShopServerFilterMeta
                        catalogFilters={catalogFilters}
                        catalogQuery={resolvedCatalogQuery}
                        onClearAll={clearFilters}
                        onNavigate={navigate}
                        showBrandFilter={showBrandFilter}
                      />
                    </div>
                  </div>
                ) : !isServerCatalog ? (
                  <div className="rbt-shop-tools-wrapper">
                    <div className="rbt-shop-tool-content rbt-shop-filter-tag-wrapper">
                      <FilterMeta state={state} dispatch={dispatch} />
                    </div>
                  </div>
                ) : null}
                {isServerCatalog && filtersLoadError ? (
                  <div className="rbt-shop-tools-wrapper">
                    <p className="mb--0 rbt-text-color-body">
                      Filter options could not be loaded from the API. You can
                      still search and sort; retry by refreshing the page.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
            {/* Start Card Area */}
            <div
              aria-busy={isCatalogLoading}
              className={`row row--12 ${hasCardBorder ? "mt--24" : ""}`}
            >
              {isCatalogLoading ? (
                <ShopProductGridSkeleton
                  columnClass={columnClass}
                  count={skeletonCount}
                  hasCardBorder={hasCardBorder}
                />
              ) : productsLoadError === "unavailable" ? (
                <div className="col-12 mt--24">
                  <div className="text-center rbt-radius p--24">
                    <h6 className="mb--8">Unable to load products</h6>
                    <p className="rbt-text-color-body mb--16">
                      The product catalog could not be loaded. Make sure the API
                      is running, then try again.
                    </p>
                    <button
                      type="button"
                      className="rbt-btn rbt-btn-sm"
                      onClick={() => router.refresh()}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : productsLoadError === "invalid_query" ? (
                <div className="col-12 mt--24">
                  <div className="text-center rbt-radius p--24">
                    <h6 className="mb--8">Invalid filter</h6>
                    <p className="rbt-text-color-body mb--16">
                      One or more filters in the URL are not valid. Clear
                      filters and try again.
                    </p>
                    <button
                      type="button"
                      className="rbt-btn rbt-btn-sm"
                      onClick={() => clearFilters()}
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              ) : hasNoFilteredItems ? (
                <ShopCatalogEmptyState
                  catalogFilters={catalogFilters}
                  catalogQuery={
                    isServerCatalog ? resolvedCatalogQuery : undefined
                  }
                  onClearAll={() =>
                    isServerCatalog ? clearFilters() : clearAllFilters(dispatch)
                  }
                  onNavigate={isServerCatalog ? navigate : undefined}
                  showBrandFilter={showBrandFilter}
                  variant={isServerCatalog ? "server" : "demo"}
                />
              ) : (
                visibleProducts.map((product) => (
                  <div
                    key={String(product.id)}
                    className={
                      columnClass +
                      (hasCardBorder ? " rbt-border mt--0" : " mt--24")
                    }
                    style={
                      hasCardBorder
                        ? { marginTop: "-1px", marginLeft: "-1px" }
                        : undefined
                    }
                  >
                    <ProductCardComponent
                      detailsPageUrl={detailsPageUrl}
                      showBestSellerBadge={showBestSellerBadge}
                      showPricingBadge={shouldShowPricingBadge}
                      shouldShowTimer={shouldShowTimer}
                      showQuantityBadge={showQuantityBadge}
                      product={product}
                      countdownStyle={countdownStyle as "default" | "compact"}
                    />
                  </div>
                ))
              )}
            </div>
            {/* End Card Area */}
            <div className="row mt--40 mt_sm--16">
              <div className="col-12">
                {isCatalogLoading ||
                hasNoFilteredItems ? null : catalogPagination ? (
                  <ShopServerPagination
                    {...catalogPagination}
                    onPageChange={(page) => navigate({ page })}
                  />
                ) : !hasMultiplePages ? null : !isLoadMore ? (
                  <ShopPagination
                    key={state.itemPerPage}
                    state={state}
                    dispatch={dispatch}
                  />
                ) : (
                  <>
                    {state.currentPage * state.itemPerPage <
                      state.sorted.length && (
                      <div className="rbt-load-more-btn-area text-center">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(state.currentPage + 1, dispatch);
                          }}
                          className="rbt-btn"
                        >
                          Load More <i className="fa-solid fa-spinner ml--4" />
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
