import OfferBadge from "@/components/common/ui/OfferBadge";
import ProductRating from "@/components/common/ui/ProductRating";
import { FireSmallIcon } from "../../svg-icons";
import Image from "next/image";

import Slider3 from "../sliders/Slider3";
import Facts from "@/components/common/other-components/Facts";
import ProductActionPanel from "../ProductActionPanel";
import ComboProducts from "../others/ComboProducts2";
import {
  comboProducts2,
  recentlyViewed3,
  recommendedProducts3,
} from "@/data/products/others";
import RecomendedProducts from "../recommandedProducts/RecomendedProducts";

import ProductOptionsPanel4 from "../productOptionsPanels/ProductOptionsPanel4";
import Tooltip from "@/components/common/ui/Tooltip";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/price";

export default function DetailsCosmetic({ product }: { product: Product }) {
  const categoryLabel = product.category?.[0];
  const stockCount = product.availableQuantity ?? 0;
  const stockProgress =
    stockCount > 0 ? Math.min(100, Math.max(8, stockCount)) : 0;
  const attributeEntries = product.attributes
    ? Object.entries(product.attributes).filter(([, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return String(value).trim().length > 0;
      })
    : [];

  return (
    <div className="rbt-component-area rbt-single-product-area rbt-bg-color-white rbt-section-gapBottom">
      <div className="container">
        <div className="row row--12 mt_dec--24 justify-content-center">
          <div className="col-xl-8 col-lg-12 mt--24">
            <div className="row row--24 justify-content-center mt_dec--24">
              <div className="col-xl-12 mt--24">
                <div className="rbt-single-product-media-area rbt-single-product-media-area-dflt">
                  <Slider3 alt={product.title} images={product.images} />
                </div>
              </div>
              <div className="col-xl-6 col-lg-12 col-12 mt--24">
                <div className="rbt-single-product-content">
                  {categoryLabel ? (
                    <span className="rbt-card-subtitle rbt-card-categories-text">
                      {categoryLabel}
                    </span>
                  ) : null}
                  <h2 className="rbt-card-title mt--12">{product.title}</h2>
                  <div className="rbt-info-wrapper d-flex mt--28">
                    <ProductRating product={product} className="mt--0">
                      <Facts />
                    </ProductRating>
                  </div>
                  <div className="rbt-info-wrapper d-flex mt--24">
                    <div className="prd-info-section">
                      <div className="prd-id-text">
                        <p className="text-bold">Brand:</p>
                        {product.brandName ? (
                          <span className="rbt-brand-img">
                            {product.brandName}
                          </span>
                        ) : (
                          <Tooltip content="Product Brand" placement="top">
                            <span className="rbt-brand-img tooltips">
                              <Image
                                alt="Brand placeholder"
                                className="image-auto"
                                height={48}
                                src="/assets/images/icons/small-brand/sm-brand-b-01.webp"
                                width={78}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className="prd-info-section has-left-separator">
                      <div className="prd-id-text">
                        <p className="text-bold">All Europe</p>
                        <Tooltip content="All Europe Delivary" placement="top">
                          <a href="#" className="rbt-brand-img tooltips">
                            <Image
                              alt="Small icon Brand"
                              src="/assets/images/icons/small-brand/sm-brand-b-02.webp"
                              width={40}
                              height={41}
                              className="image-auto"
                            />
                          </a>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="prd-info-section has-left-separator">
                      <div className="prd-id-text">
                        <p className="text-bold">Verified:</p>
                        <Tooltip content="Verified Product" placement="top">
                          <span className="rbt-brand-img tooltips">
                            <Image
                              alt="Small icon Brand"
                              src="/assets/images/icons/small-brand/sm-brand-b-03.webp"
                              width={40}
                              height={41}
                            />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-info-wrapper d-flex justify-content-between mt--16">
                    <div className="rbt-store-price-1">
                      <div className="pricing-part mt--0">
                        {product.oldPrice ? (
                          <del className="price-text">
                            {formatCurrency(product.oldPrice)}
                          </del>
                        ) : null}
                        <span className="price-text">
                          {formatCurrency(product.price)}
                        </span>
                        <OfferBadge
                          product={product}
                          className="rbt-offer-badge-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rbt-info-wrapper d-flex mt--24 rbt-gap--12 flex-wrap">
                    <div className="prd-info-section">
                      <a
                        className="rbt-quick-info-tag d-flex align-items-center rbt-gap--8 rbt-flash-animation"
                        href="#"
                      >
                        <FireSmallIcon />
                        <p>
                          <strong>34 products sold in last 10 hours.</strong>
                        </p>
                      </a>
                    </div>
                  </div>
                  {attributeEntries.length > 0 ? (
                    <>
                      <hr className="rbt-separator rbt-separator-gray200 mt--24 mb--24" />
                      <ul className="product-details-list shipment-details-list">
                        {attributeEntries.map(([slug, value]) => (
                          <li key={slug}>
                            <span className="icon">
                              <i className="fa-regular fa-tag" />
                            </span>
                            <div className="right-content">
                              <span className="rbt-bold--text">
                                {slug.replace(/-/g, " ")}:
                              </span>
                              <span className="text">
                                {" "}
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : value}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <hr className="rbt-separator rbt-separator-gray200 mt--24 mb--24" />
                  <ul className="product-details-list shipment-details-list">
                    <li>
                      <span className="icon">
                        <i className="fa-sharp fa-regular fa-truck" />
                      </span>
                      <div className="right-content">
                        <span className="rbt-bold--text">
                          Estimated Delivery :
                        </span>
                        <span className="text"> 15 - 22 Nov, 2026</span>
                      </div>
                    </li>
                    <li>
                      <span className="icon">
                        <i className="fa-regular fa-bag-shopping" />
                      </span>
                      <div className="right-content">
                        <span className="rbt-bold--text">7 Days Returns :</span>
                        <a href="#" className="shipment-quick-link">
                          Free return within 7 days of purchase
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-6 col-lg-12 col-12 mt--24">
                <div className="rbt-single-product-content rbt-product-variations">
                  {/* Start Dynamic Color Swatches Area */}
                  <ProductOptionsPanel4 />

                  {/* End Dynamic Color Swatches Area */}
                  <div className="rbt-info-wrapper d-block mt--24">
                    <div className="rbt-prd-qty-area">
                      <p className="prd-qty-txt">
                        <strong>
                          {stockCount > 0
                            ? `${stockCount} in stock`
                            : "Out of stock"}
                        </strong>
                      </p>
                      <div
                        aria-label="Stock progress"
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={stockProgress}
                        className="progress"
                        role="progressbar"
                      >
                        <div
                          className="progress-bar"
                          style={{ width: `${stockProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ProductActionPanel product={product} />
                </div>
              </div>
            </div>
            <div className="rbt-combo-prd-box rbt-bg-color-white mt--24">
              <div className="row justify-content-between">
                <div className="col-lg-12">
                  <div className="rbt-combo-title-section flex-row">
                    <i className="fa-regular fa-cube" />
                    <h5 className="rbt-title">
                      There&apos;s more in the complete bundle
                    </h5>
                  </div>
                </div>

                <ComboProducts products={comboProducts2} />
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-12 mt--24 rbt-single-mobile-view-sidebar">
            <RecomendedProducts
              recentlyViewedProducts={recentlyViewed3}
              recommendedProducts={recommendedProducts3}
            />
            <div className="rbt-block-banner-img mt--32">
              <Image
                alt="Ecommerce Product Banner"
                src="/assets/images/product-single/single-prd-banner/single-prd-banner-a-01.webp"
                width={1696}
                height={2708}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
