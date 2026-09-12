"use client";
import { Dispatch } from "react";
import {
  setPriceRange,
  toggleBrand,
  toggleCategory,
  toggleColor,
  toggleRating,
  toggleService,
} from "../reducer/filterActions";
import FilterByCategories from "./filterComponents/FilterByCategories";
import FilterByReview from "./filterComponents/FilterByReview";
import FilterByPrice from "./filterComponents/FilterByPrice";
import FilterByColor from "./filterComponents/FilterByColor";
import FilterByBrand from "./filterComponents/FilterByBrand";
import FilterByService from "./filterComponents/FilterByService";
import { FilterState, FilterAction } from "@/types";
import { Product } from "@/types";
import type { ShopCatalogFilters } from "@/types/shop-catalog";

type ServerCatalogControls = {
  brandId?: string;
  categoryId?: string;
  maxPrice?: number;
  minPrice?: number;
  onBrandChange: (brandId?: string) => void;
  onCategoryChange: (categoryId?: string) => void;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
};

export default function Sidebar({
  catalogFilters,
  serverCatalog,
  showBrandFilter = true,
  state,
  dispatch,
  getFilterCount,
}: {
  catalogFilters?: ShopCatalogFilters;
  serverCatalog?: ServerCatalogControls;
  showBrandFilter?: boolean;
  state: FilterState;
  dispatch: Dispatch<FilterAction>;
  getFilterCount: (fn: (product: Product) => boolean) => number;
}) {
  const serverMode = Boolean(serverCatalog);
  return (
    <div className="rbt-sidebar-bottom">
      {/* Start Widget Area  */}
      <div className="rbt-single-widget rbt-widget-categories">
        <div className="bt-single-widget-inner">
          <h4 className="rbt-widget-title rbt-widget-title-without-border">
            <a
              data-bs-toggle="collapse"
              href="#rbt-collapse-3"
              role="button"
              aria-expanded="false"
              aria-controls="rbt-collapse-3"
            >
              Categories
              <span className="icon">
                <i className="fa-regular fa-chevron-down" />
              </span>
            </a>
          </h4>
          <div className="collapse show" id="rbt-collapse-3">
            <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check">
              <FilterByCategories
                categories={catalogFilters?.categories}
                getFilterCount={getFilterCount}
                onChange={(value) =>
                  toggleCategory(value, dispatch, state.categories)
                }
                onSelectId={serverCatalog?.onCategoryChange}
                selectedId={serverCatalog?.categoryId}
                selectedItems={state.categories}
                serverMode={serverMode}
              />
            </ul>
          </div>
        </div>
      </div>
      {/* End Widget Area  */}
      {!serverMode ? (
        <>
          {/* Start Widget Area  */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="bt-single-widget-inner">
              <h4 className="rbt-widget-title rbt-widget-title-without-border">
                <a
                  data-bs-toggle="collapse"
                  href="#rbt-collapse-6"
                  role="button"
                  aria-expanded="false"
                  aria-controls="rbt-collapse-6"
                >
                  Customer Reviews
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h4>
              <div className="collapse show" id="rbt-collapse-6">
                <ul className="rbt-sidebar-list-wrapper rbt-categories-review-list">
                  <FilterByReview
                    selectedItems={state.ratings}
                    onChange={(value) =>
                      toggleRating(value, dispatch, state.ratings)
                    }
                  />
                </ul>
              </div>
            </div>
          </div>
          {/* End Widget Area  */}
        </>
      ) : null}
      {/* Start Widget Area  */}
      <div className="rbt-single-widget rbt-widget-categories">
        <div className="bt-single-widget-inner">
          <h4 className="rbt-widget-title rbt-widget-title-without-border">
            <a
              data-bs-toggle="collapse"
              href="#rbt-collapse-7"
              role="button"
              aria-expanded="false"
              aria-controls="rbt-collapse-7"
            >
              Filter by price
              <span className="icon">
                <i className="fa-regular fa-chevron-down" />
              </span>
            </a>
          </h4>
          <div className="collapse show" id="rbt-collapse-7">
            <FilterByPrice
              getFilterCount={getFilterCount}
              onChange={(value) => setPriceRange(value, dispatch)}
              onServerPriceChange={serverCatalog?.onPriceChange}
              priceRange={state.price}
              selectedMax={serverCatalog?.maxPrice}
              selectedMin={serverCatalog?.minPrice}
              serverMode={serverMode}
              serverPriceFilter={catalogFilters?.priceFilter}
            />
          </div>
        </div>
      </div>
      {/* End Widget Area  */}
      {!serverMode ? (
        <>
          {/* Start Widget Area  */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="bt-single-widget-inner">
              <h4 className="rbt-widget-title rbt-widget-title-without-border pb--0">
                <a
                  data-bs-toggle="collapse"
                  href="#rbt-collapse-8"
                  role="button"
                  aria-expanded="false"
                  aria-controls="rbt-collapse-8"
                >
                  Filter by color
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h4>
              <div className="rbt-inner-search-field border-0 pt--16 pb--16">
                <div className="rbt-search-input-section rbt-sm-search-section">
                  <input
                    className="rbt-filter-search-field"
                    type="text"
                    placeholder="Search and Select Product"
                  />
                  <span className="search-btn search-btn-dark bg-transparent rbt-text-color-gray-400">
                    <i className="fa-sharp fa-solid fa-magnifying-glass" />
                  </span>
                </div>
              </div>
              <div className="collapse show" id="rbt-collapse-8">
                <FilterByColor
                  getFilterCount={getFilterCount}
                  selectedItems={state.colors}
                  onChange={(value) =>
                    toggleColor(value, dispatch, state.colors)
                  }
                />
              </div>
            </div>
          </div>
          {/* End Widget Area  */}
        </>
      ) : null}
      {showBrandFilter ? (
        <>
          {/* Start Widget Area  */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="bt-single-widget-inner">
              <h4 className="rbt-widget-title rbt-widget-title-without-border">
                <a
                  data-bs-toggle="collapse"
                  href="#rbt-collapse-9"
                  role="button"
                  aria-expanded="false"
                  aria-controls="rbt-collapse-9"
                >
                  Brand
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h4>
              <div className="collapse show" id="rbt-collapse-9">
                <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check rbt-categories-brand-list-check">
                  <FilterByBrand
                    brands={catalogFilters?.brands}
                    getFilterCount={getFilterCount}
                    onChange={(value) =>
                      toggleBrand(value, dispatch, state.brands)
                    }
                    onSelectId={serverCatalog?.onBrandChange}
                    selectedId={serverCatalog?.brandId}
                    selectedItems={state.brands}
                    serverMode={serverMode}
                  />
                </ul>
              </div>
            </div>
          </div>
          {/* End Widget Area  */}
        </>
      ) : null}
      {!serverMode ? (
        <>
          {/* Start Widget Area  */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="bt-single-widget-inner">
              <h4 className="rbt-widget-title rbt-widget-title-without-border">
                <a
                  data-bs-toggle="collapse"
                  href="#rbt-collapse-10"
                  role="button"
                  aria-expanded="false"
                  aria-controls="rbt-collapse-10"
                >
                  Promotion &amp; Services
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h4>
              <div className="collapse show" id="rbt-collapse-10">
                <div className="rbt-sidebar-list-wrapper rbt-tag-list justify-content-start pt--0">
                  <FilterByService
                    selectedItems={state.services}
                    onChange={(value) =>
                      toggleService(value, dispatch, state.services)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          {/* End Widget Area  */}
        </>
      ) : null}
    </div>
  );
}
