"use client";

import { useUiElement } from "@/context/uiStore";
import StorefrontSearchTrendingProducts from "@/components/store/StorefrontSearchTrendingProducts";
import Tooltip from "@/components/common/ui/Tooltip";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import Link from "next/link";
import StorefrontProductSearchForm from "@/components/store/StorefrontProductSearchForm";
import { buildShopCatalogHref, createShopCatalogQuery } from "@/lib/shop-query";

const POPULAR_SEARCHES = [
  "Fashion",
  "Interior",
  "Nature",
  "Elementor",
  "Art",
  "Aliexpress",
  "Technology",
  "Texture",
  "Architecture",
  "Business",
  "Elementor",
  "Aliexpress",
];

export default function SearchDropdownCommon() {
  const { closeCommonSearch, commonSearchOpen } = useUiElement();
  const { registerInputRef, getTooltip, copyFromRef, isCopied } =
    useCopyToClipboard({ defaultTooltip: "Copy" });
  return (
    <div
      id="header-common-search-dropdown"
      role="dialog"
      aria-modal="false"
      aria-label="Sticky header product search panel"
      className={`rbt-search-dropdown rbt-common-search-dropdown-activation${commonSearchOpen ? " active" : ""}`}
    >
      <div className="wrapper">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-section-title border-0 p-0 text-center">
              <h4 className="rbt-title text-start text-md-center">
                <span className="rbt-bold--text">Search For Products</span>
              </h4>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <StorefrontProductSearchForm onSubmitted={closeCommonSearch} />
            <div className="rbt-search-form">
              <div className="rbt-media-search-section">
                <div className="rbt-media-wrapper">
                  <div className="section-title">
                    <span className="title b1">
                      Find product inspiration with Image Search
                    </span>
                  </div>
                  <div className="rbt-file-upload-container">
                    <input type="file" className="fileInput" multiple hidden />
                    <div className="file-upload-area fileUploadArea">
                      <div className="file-upload-content">
                        <span className="rbt-icon">
                          <i
                            className="fa-solid fa-cloud-arrow-up"
                            aria-hidden="true"
                          />
                        </span>
                        <p className="rbt-title">
                          Drag &amp; Drop Files Here{" "}
                          <span className="rbt-text-color-gray-400">Or</span>
                        </p>
                        <button
                          type="button"
                          className="browseFilesButton rbt-btn rbt-btn-sm"
                        >
                          Browse Files
                        </button>
                      </div>
                      <div className="fileList file-list" />
                    </div>
                    <p className="fileCount">0 of 10</p>
                  </div>
                  <div className="rbt-copy-link-part rbt-text-copy-activation">
                    <input
                      ref={registerInputRef("search-dropdown-common-link")}
                      className="rbt-copy-value-field"
                      type="text"
                      defaultValue="https://beauty-station.template/wishlist"
                      readOnly
                    />
                    <Tooltip
                      content={getTooltip("search-dropdown-common-link")}
                      placement="top"
                      forceOpen={isCopied("search-dropdown-common-link")}
                    >
                      <button
                        type="button"
                        className="rbt-btn rbt-btn-xs has-left-icon rbt-copy-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          void copyFromRef("search-dropdown-common-link");
                        }}
                      >
                        <i className="fa-regular fa-copy" aria-hidden="true" />
                        <span className="rbt-btn-text">Copy</span>
                      </button>
                    </Tooltip>
                  </div>
                  <button
                    type="button"
                    className="rbt-round-btn rbt-ms-dismiss-btn"
                    aria-label="Close image search panel"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="rbt-ms-dismiss-outsider"
                aria-label="Close search dropdown"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="border-0 p-0 text-left title-sm-fsize">
              <h6 className="title">
                <span className="rbt-bold--text">Popular searches</span>
              </h6>
            </div>
          </div>
          <div className="rbt-search-list-wrapper rbt-tag-list rbt-tag-list-rounded-lg">
            {POPULAR_SEARCHES.map((keyword, index) => (
              <Link
                key={`${keyword}-${index}`}
                href={buildShopCatalogHref(
                  createShopCatalogQuery({ page: 1, search: keyword })
                )}
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
        <div className="rbt-separator-mid ptb--24">
          <hr className="rbt-separator m-0" />
        </div>
        {/* Start Card Area */}
        <div className="row">
          <div className="col-lg-12">
            <div className="border-0 p-0 text-left title-sm-fsize">
              <h6 className="title">
                <span className="rbt-bold--text">Trending Products</span>
              </h6>
            </div>
          </div>
        </div>
        <StorefrontSearchTrendingProducts />
        {/* End Card Area */}
      </div>
    </div>
  );
}
