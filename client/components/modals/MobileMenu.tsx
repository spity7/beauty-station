"use client";

import { ExternalLinkAltIcon } from "../svg-icons";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Counter from "../common/ui/Counter";
import { useManagedModalPanel } from "@/hooks/useManagedModalPanel";
import {
  categoryMegamenus,
  categorySimpleLinks,
  demoData,
  navBrandList,
  shopPages,
  innerPageMenuColumns,
  elementsMenuColumns,
  uxMenuColumns,
  supportMenuItems,
} from "@/data/menu";
import type { MenuItem } from "@/types";
import { usePathname } from "next/navigation";
import { isInternalHref, isPathActive } from "@/lib/nav";
import { mobileMenuSocialLinks } from "@/data/socials";
import { contactInfo } from "@/data/contact";
import { getStackedModalZIndex } from "@/lib/modalStack";
import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import { allElectronocsProducts } from "@/data/products/electronics";
import { formatCurrency } from "@/lib/price";

const menuBannerProduct =
  allElectronocsProducts.find((product) => product.id === 132) ??
  allElectronocsProducts[0];

const BADGE_CLASS: Record<string, string> = {
  green: "rbt-product-badge-bg-green",
  primary: "rbt-product-badge-bg-primary",
  danger: "rbt-product-badge-bg-danger",
  yellow: "rbt-product-badge-bg-yellow",
  red: "rbt-product-badge-bg-red",
  success: "rbt-product-badge-bg-success",
  secondary: "rbt-product-badge-bg-secondary",
};

function getBadgeClass(color?: string) {
  return color && BADGE_CLASS[color]
    ? BADGE_CLASS[color]
    : "rbt-product-badge-bg-primary";
}

function MenuItemLink({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) {
  const isActive =
    isInternalHref(item.href) && isPathActive(pathname, item.href);
  const activeClass = isActive ? "active" : "";

  const badge = item.badge ? (
    <div
      className={`rbt-product-badge ${getBadgeClass(item.badgeColor)} border-rounded ml--8`}
    >
      {item.badge}
    </div>
  ) : null;
  const content = (
    <>
      {item.label}
      {badge}
    </>
  );
  if (item.useLink)
    return (
      <Link href={item.href} className={activeClass}>
        {content}
      </Link>
    );
  if (item.href.startsWith("http") || item.href === "#!" || item.href === "#") {
    return (
      <a
        href={item.href === "#!" || item.href === "#" ? "#!" : item.href}
        className={activeClass}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={item.href} className={activeClass}>
      {content}
    </Link>
  );
}

export default function MobileMenu() {
  const {
    activeBsModal,
    isAnimatedOpen: mobileMenuOpen,
    close,
  } = useManagedModalPanel("mobileMenu");
  const pathname = usePathname();
  const [openMenuIds, setOpenMenuIds] = useState<Set<string>>(new Set());
  const [activeRootTab, setActiveRootTab] = useState<"menu" | "categories">(
    "menu"
  );

  const isHomeActive = demoData.some((item) =>
    isPathActive(pathname, item.href)
  );

  const shopPagesItems = shopPages.flatMap((section) => section.items);
  const isShopActive = shopPagesItems.some((item) =>
    isPathActive(pathname, item.href)
  );

  const pagesItems = innerPageMenuColumns.flatMap((section) => section.items);
  const isPagesActive = pagesItems.some((item) =>
    isPathActive(pathname, item.href)
  );

  const elementsItems = elementsMenuColumns.flatMap((section) => section.items);
  const isElementsActive = elementsItems.some((item) =>
    isPathActive(pathname, item.href)
  );

  const coreFeaturesItems = uxMenuColumns.flatMap((section) => section.items);
  const isCoreFeaturesActive = coreFeaturesItems.some((item) =>
    isPathActive(pathname, item.href)
  );

  const isMoreActive = supportMenuItems.some((item) =>
    isPathActive(pathname, item.href)
  );

  const closeMenu = () => {
    setOpenMenuIds(new Set());
    setActiveRootTab("menu");
    close();
  };

  const toggleMenu = (id: string) => {
    setOpenMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBackdropClick = () => {
    if (mobileMenuOpen) closeMenu();
  };

  return (
    <div
      className={`popup-mobile-menu ${mobileMenuOpen ? "active" : ""}`}
      onClick={handleBackdropClick}
      role="presentation"
      style={{
        zIndex: getStackedModalZIndex(activeBsModal, "mobileMenu"),
      }}
    >
      <div className="inner-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-top">
          <div className="inner-top">
            <div className="content">
              <div className="logo">
                <Link href={`/`}>
                  <Image
                    alt="Beauty Station Logo Images"
                    src="/assets/images/logo/logo.webp"
                    width={1487}
                    height={334}
                  />
                </Link>
              </div>
              <div className="rbt-btn-close">
                <button
                  className="close-button rbt-round-btn"
                  onClick={closeMenu}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
            <p className="description">
              Beauty Station is a E-commerce Template. Worldwide electronics
              store since 1978.
            </p>
            <div className="rbt-inner-search-field style-one rbt-search-field-rounded rbt-search-field-sm-width">
              <input type="text" placeholder="Search for products" />
              <button
                className="rbt-round-btn search-btn rbt-text-color-gray-500"
                type="submit"
              >
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </div>
          </div>
          <div className="rbt-tab rbt-round-shape-tab">
            <ul
              className="nav nav-tabs mb--0"
              id="mobile-menuTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeRootTab === "menu" ? " active" : ""}`}
                  id="rbt-tab-mobile-menu-1"
                  type="button"
                  role="tab"
                  aria-controls="rbt-tab-pane-mobile-menu-1"
                  aria-selected={activeRootTab === "menu"}
                  onClick={() => setActiveRootTab("menu")}
                >
                  <i className="fa-solid fa-bars-sort" />
                  Menu
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${
                    activeRootTab === "categories" ? " active" : ""
                  }`}
                  id="rbt-tab-mobile-menu-2"
                  type="button"
                  role="tab"
                  aria-controls="rbt-tab-pane-mobile-menu-2"
                  aria-selected={activeRootTab === "categories"}
                  onClick={() => setActiveRootTab("categories")}
                >
                  <i className="fa-sharp fa-regular fa-layer-group" />
                  Catagories
                </button>
              </li>
            </ul>
            <div className="tab-content" id="mobile-menuTabContent">
              {activeRootTab === "menu" && (
                <div
                  className="tab-pane fade show active"
                  id="rbt-tab-pane-mobile-menu-1"
                  role="tabpanel"
                  aria-labelledby="rbt-tab-mobile-menu-1"
                  tabIndex={0}
                >
                  <nav className="rbt-mainmenu-nav">
                    <ul className="mainmenu">
                      <li className="with-rbt-megamenu has-menu-child-item position-static">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-home");
                          }}
                          className={`${openMenuIds.has("menu-home") ? "open" : ""}${
                            isHomeActive ? " active" : ""
                          }`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-home")}
                        >
                          Home <i className="fa-regular fa-chevron-down" />
                        </a>
                        {/* Start Mega Menu  */}
                        <div
                          className={`rbt-megamenu rbt-presentation-megamenu rbt-width-fullscreen ${openMenuIds.has("menu-home") ? "active" : ""}`}
                        >
                          <div className="rbt-megamenu-wrapper">
                            <div className="container p_sm--0 p_md--0 p_lg--0">
                              <div className="row row--12 home-plesentation-wrapper single-dropdown-menu-presentation mt_dec--24">
                                {demoData.map((item, index) => {
                                  const itemIsActive = isPathActive(
                                    pathname,
                                    item.href
                                  );

                                  return (
                                    <div
                                      key={item.href}
                                      className={`col-lg-1-5 col-md-12 col-sm-12 col-12 single-mega-item rbt-scroll-trigger fade_in animation-order-${index + 1}`}
                                    >
                                      <div
                                        className={`demo-single rbt-scroll-trigger zoom_in animation-order-${index + 1}${itemIsActive ? " active" : ""}`}
                                      >
                                        <div className="inner">
                                          <div className="thumbnail">
                                            <Link href={item.href}>
                                              <Image
                                                alt="Demo Images"
                                                src={item.src}
                                                width={item.width}
                                                height={item.height}
                                              />
                                            </Link>
                                          </div>
                                          <div className="content">
                                            <h4 className="rbt-title">
                                              <Link
                                                href={item.href}
                                                className={
                                                  itemIsActive
                                                    ? "active"
                                                    : undefined
                                                }
                                              >
                                                {item.title}
                                              </Link>
                                            </h4>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="load-demo-btn text-center pt--24 pt_sm--0 pt_lg--0 position-relative">
                                <Link
                                  href={`/#rbt-demo-presentation-section`}
                                  className="rbt-btn-grp rbt-has-separator-shape justify-content-center rbt-scroll-trigger fade_in animation-order-2"
                                >
                                  <span className="rbt-btn rbt-btn-single rbt-btn rbt-marquee-btn marquee-auto rbt-btn-md has-primary-overlay has-no-hover-transform">
                                    <span data-text="View All The Trending Collection">
                                      VIEW ALL DEMOS (80+) New drops every month
                                      🔥
                                    </span>
                                  </span>
                                  <span className="rbt-btn rbt-btn-single animated-icon-btn round-sm default-primary-bg p--0">
                                    <span className="animated-icon">
                                      <ExternalLinkAltIcon />
                                    </span>
                                  </span>
                                </Link>
                                <span className="rbt-overlay-counter counter-md rbt-scroll-trigger fade_in animation-order-4">
                                  <Counter max={100} />
                                  <span className="counter-suffix">+</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* End Mega Menu  */}
                      </li>
                      <li className="with-rbt-megamenu has-menu-child-item">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-shop");
                          }}
                          className={`${openMenuIds.has("menu-shop") ? "open" : ""}${
                            isShopActive ? " active" : ""
                          }`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-shop")}
                        >
                          Shop <i className="fa-regular fa-chevron-down" />
                        </a>
                        {/* Start Mega Menu  */}
                        <div
                          className={`rbt-megamenu grid-item-3 pl_sm--0 pl_md--0 pl_lg--0 ${openMenuIds.has("menu-shop") ? "active" : ""}`}
                        >
                          <div className="rbt-megamenu-wrapper">
                            <div className="row d-none d-xl-flex">
                              <div className="col-lg-12">
                                <div className="mega-top-banner bg-two">
                                  <div className="rbt-banner-inner justify-content-start">
                                    <div className="rbt-banner-content">
                                      <h5 className="title">
                                        Buy One and Get 50% Off the Second
                                        Purchase Now
                                      </h5>
                                      <p className="b3 desc">
                                        Send us your idea, it may appear on
                                        Beauty Station.
                                      </p>
                                    </div>
                                    <div className="pricing-action d-flex flex-column align-items-center rbt-gap--8">
                                      <div className="rbt-pricing-part d-flex">
                                        <span className="rbt-price-text offer-price">
                                          {formatCurrency(
                                            menuBannerProduct.price
                                          )}
                                        </span>
                                        {menuBannerProduct.oldPrice ? (
                                          <del className="rbt-dis-price-text">
                                            {formatCurrency(
                                              menuBannerProduct.oldPrice
                                            )}
                                          </del>
                                        ) : null}
                                      </div>
                                      <Link
                                        className="rbt-btn rbt-btn-sm rbt-btn-black"
                                        href={`/product-single-default/132`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <a
                                      href="#"
                                      className="product-img position-bottom"
                                    >
                                      <Image
                                        alt="Ecommerce Product"
                                        src="/assets/images/splash/menu-banner/menu-prd-01.webp"
                                        width={278}
                                        height={280}
                                      />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row row--16">
                              {shopPages.map((section, sectionIdx) => {
                                const sectionIsActive = section.items.some(
                                  (item) =>
                                    isInternalHref(item.href) &&
                                    isPathActive(pathname, item.href)
                                );
                                return (
                                  <div
                                    key={`shop-${section.title}-${sectionIdx}`}
                                    className="col-lg-12 col-xl-6 col-xxl-4 single-mega-item rbt-scroll-trigger fade_in animation-order-1"
                                  >
                                    <h6
                                      className={`rbt-short-title${
                                        sectionIsActive ? " active" : ""
                                      }`}
                                    >
                                      {section.title}
                                    </h6>
                                    <ul className="mega-menu-item">
                                      {section.items.map((item) => (
                                        <li key={`${item.href}-${item.label}`}>
                                          <MenuItemLink
                                            item={item}
                                            pathname={pathname}
                                          />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        {/* End Mega Menu  */}
                      </li>
                      <li className="with-rbt-megamenu has-menu-child-item position-static">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-pages");
                          }}
                          className={`${openMenuIds.has("menu-pages") ? "open" : ""}${
                            isPagesActive ? " active" : ""
                          }`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-pages")}
                        >
                          Pages <i className="fa-regular fa-chevron-down" />
                        </a>
                        {/* Start Mega Menu  */}
                        <div
                          className={`rbt-megamenu rbt-width-fullscreen mega-has-bg-img mega-bg-one p-0 ${openMenuIds.has("menu-pages") ? "active" : ""}`}
                        >
                          {/* Start Mega Menu  */}
                          <div className="rbt-megamenu-wrapper bg-transparent">
                            <div className="wrapper">
                              <div className="row row--12 mt_dec--12">
                                <div className="col-xl-9">
                                  <div className="h-100 d-flex flex-column justify-content-between">
                                    <div className="row">
                                      {innerPageMenuColumns.map(
                                        (section, sectionIdx) => (
                                          <div
                                            key={`pages-${section.title}-${sectionIdx}`}
                                            className="col-12 col-lg-1-5 single-mega-item rbt-scroll-trigger fade_in animation-order-1 mt--16"
                                          >
                                            <h6 className="rbt-short-title">
                                              {section.title}
                                            </h6>
                                            <ul className="mega-menu-item">
                                              {section.items.map((item) => (
                                                <li
                                                  key={`${item.href}-${item.label}`}
                                                >
                                                  <MenuItemLink
                                                    item={item}
                                                    pathname={pathname}
                                                  />
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className="row">
                                      <div className="col-12">
                                        <hr className="rbt-separator rbt-separator-gray200 mb--16 mt--16 mt_sm--12 mb_sm--12 rbt-bg-color-gray-100" />
                                      </div>
                                      <div className="col-lg-12">
                                        <ul className="rbt-nav-brand-list liststyle d-flex justify-content-xl-between">
                                          {navBrandList.map((brand, index) => (
                                            <li
                                              key={`nav-brand-pages-${index}`}
                                            >
                                              <Link href="/shop-by-brands">
                                                <Image
                                                  alt="Ecommerce Brand Image"
                                                  src={brand.src}
                                                  width={brand.width}
                                                  height={brand.height}
                                                  className="image-auto"
                                                />
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* End Mega Menu  */}
                        </div>
                        {/* End Mega Menu  */}
                      </li>
                      <li className="with-rbt-megamenu has-menu-child-item position-static">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-elements");
                          }}
                          className={`${openMenuIds.has("menu-elements") ? "open" : ""}${
                            isElementsActive ? " active" : ""
                          }`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-elements")}
                        >
                          Elements <i className="fa-regular fa-chevron-down" />
                        </a>
                        {/* Start Mega Menu  */}
                        <div
                          className={`rbt-megamenu container pl_sm--0 pl_md--0 pl_lg--0 ${openMenuIds.has("menu-elements") ? "active" : ""}`}
                        >
                          <div className="rbt-megamenu-wrapper">
                            <div className="row row--12 d-flex justify-content-between">
                              <div className="col-xl-9">
                                <div className="h-100 d-flex flex-column justify-content-between">
                                  <div className="row row--12">
                                    {elementsMenuColumns.map(
                                      (section, sectionIdx) => (
                                        <div
                                          key={`elements-${section.title}-${sectionIdx}`}
                                          className="col-xl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-1"
                                        >
                                          <h6 className="rbt-short-title">
                                            {section.title}
                                          </h6>
                                          <ul className="mega-menu-item">
                                            {section.items.map((item) => (
                                              <li
                                                key={`${item.href}-${item.label}`}
                                              >
                                                <MenuItemLink
                                                  item={item}
                                                  pathname={pathname}
                                                />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="row row--12 d-none d-xl-flex">
                                    <div className="col-12">
                                      <hr className="rbt-separator rbt-separator-gray200 mb--16 mt--16 mt_sm--12 mb_sm--12 rbt-bg-color-gray-100" />
                                    </div>
                                    <div className="col-lg-12">
                                      <ul className="rbt-nav-brand-list liststyle d-flex justify-content-xl-between">
                                        {navBrandList.map((brand, index) => (
                                          <li
                                            key={`nav-brand-elements-${index}`}
                                          >
                                            <Link href="/shop-by-brands">
                                              <Image
                                                alt="Ecommerce Brand Image"
                                                src={brand.src}
                                                width={brand.width}
                                                height={brand.height}
                                              />
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-xl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-1">
                                <div className="rbt-menu-offer-card rbt-bg-style-box rbt-bg-two">
                                  <div className="mega-top-banner">
                                    <div className="rbt-banner-inner flex-column justify-content-center rbt-gap--8 align-items-center text-center">
                                      <div className="rbt-banner-content">
                                        <h5 className="title rbt-text-color-white">
                                          New Aurora Watch
                                        </h5>
                                        <p className="b3 desc rbt-text-color-gray-200">
                                          Send your idea, appear Beauty Station.
                                        </p>
                                      </div>
                                      <a
                                        className="rbt-btn rbt-btn-sm"
                                        href="#"
                                      >
                                        View Details
                                      </a>
                                      <a
                                        href="#"
                                        className="product-img position-bottom mt--24"
                                      >
                                        <Image
                                          alt="Ecommerce Product"
                                          src="/assets/images/splash/menu-banner/menu-prd-03-lg.webp"
                                          width={520}
                                          height={408}
                                        />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* End Mega Menu  */}
                      </li>
                      <li className="with-rbt-megamenu has-menu-child-item position-static">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-core-features");
                          }}
                          className={`${
                            openMenuIds.has("menu-core-features") ? "open" : ""
                          }${isCoreFeaturesActive ? " active" : ""}`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-core-features")}
                        >
                          Core Features{" "}
                          <i className="fa-regular fa-chevron-down" />
                        </a>
                        {/* Start Mega Menu  */}
                        <div
                          className={`rbt-megamenu p-0 container ${openMenuIds.has("menu-core-features") ? "active" : ""}`}
                        >
                          {/* Start Mega Menu  */}
                          <div className="rbt-megamenu-wrapper p--0">
                            <div className="wrapper">
                              <div className="row row--0 mt_dec--32">
                                <div className="col-xl-8 mt--24 rbt-scroll-trigger zoom_in animation-order-2">
                                  <div className="rbt-inner-menu-wrapper p--24 p_sm--0 p_md--0 p_lg--0">
                                    <div className="row row-12 mt_dec--16">
                                      {uxMenuColumns.map(
                                        (section, sectionIdx) => (
                                          <div
                                            key={`ux-${section.title}-${sectionIdx}`}
                                            className="col-12 col-xl-4 single-mega-item rbt-scroll-trigger fade_in animation-order-1 mt--16"
                                          >
                                            <h6 className="rbt-short-title">
                                              {section.title}
                                            </h6>
                                            <ul className="mega-menu-item">
                                              {section.items.map((item) => (
                                                <li
                                                  key={`${item.href}-${item.label}`}
                                                >
                                                  <MenuItemLink
                                                    item={item}
                                                    pathname={pathname}
                                                  />
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-xl-4 mt--24 single-mega-item rbt-scroll-trigger zoom_in animation-order-2">
                                  <Image
                                    className="h-100"
                                    alt="Ecommerce Banner"
                                    src="/assets/images/header-bg/megamenu-banner-hr-01.webp"
                                    width={976}
                                    height={990}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* End Mega Menu  */}
                        </div>
                        {/* End Mega Menu  */}
                      </li>
                      <li className="has-dropdown position-relative">
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu("menu-more");
                          }}
                          className={`${openMenuIds.has("menu-more") ? "open" : ""}${
                            isMoreActive ? " active" : ""
                          }`}
                          role="button"
                          aria-expanded={openMenuIds.has("menu-more")}
                        >
                          More <i className="fa-regular fa-chevron-down" />
                        </a>
                        <ul
                          className={`submenu ${openMenuIds.has("menu-more") ? "active" : ""}`}
                        >
                          {supportMenuItems.map((item) => (
                            <li key={item.href + item.label}>
                              <MenuItemLink item={item} pathname={pathname} />
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
              {activeRootTab === "categories" && (
                <div
                  className="tab-pane fade show active"
                  id="rbt-tab-pane-mobile-menu-2"
                  role="tabpanel"
                  aria-labelledby="rbt-tab-mobile-menu-2"
                  tabIndex={0}
                >
                  <nav className="rbt-mainmenu-nav">
                    <ul className="mainmenu">
                      {categoryMegamenus.map((cat, catIndex) => {
                        const catMenuId = `cat-${catIndex}`;
                        return (
                          <li
                            key={cat.label}
                            className="with-rbt-megamenu has-menu-child-item position-static"
                          >
                            <a
                              href="#!"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMenu(catMenuId);
                              }}
                              className={
                                openMenuIds.has(catMenuId) ? "open" : ""
                              }
                              role="button"
                              aria-expanded={openMenuIds.has(catMenuId)}
                            >
                              <span>
                                <i
                                  className={`rbt-categories-icon mr--8 ${cat.icon}`}
                                />
                              </span>
                              {cat.label}
                              <span className="rbt-chevron-right">
                                <i className="fa-regular fa-chevron-right" />
                              </span>
                            </a>
                            {/* Start Mega Menu  */}
                            <div
                              className={`rbt-megamenu grid-item-5 pl_sm--0 pl_md--0 pl_lg--0 ${openMenuIds.has(catMenuId) ? "active" : ""}`}
                            >
                              <div className="container p_sm--0 p_md--0 p_lg--0">
                                <div className="rbt-megamenu-wrapper">
                                  <div className="row row--12">
                                    {cat.sections.map((section, sectionIdx) => (
                                      <div
                                        key={`${cat.label}-${section.title}-${sectionIdx}`}
                                        className="col-lg-12 col-xl-3 col-xxl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-1"
                                      >
                                        <h6 className="rbt-short-title">
                                          {section.title}
                                        </h6>
                                        <ul className="mega-menu-item">
                                          {section.items.map((item) => (
                                            <li
                                              key={`${item.href}-${item.label}`}
                                            >
                                              <MenuItemLink
                                                item={item}
                                                pathname={pathname}
                                              />
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                    <div className="col-lg-12 col-xl-3 col-xxl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-1">
                                      <div
                                        className={`rbt-menu-offer-card ${cat.banner.bannerCardClass ?? ""}`}
                                      >
                                        <div
                                          className={`mega-top-banner ${cat.banner.bannerInnerClass ?? ""}`}
                                        >
                                          <div className="rbt-banner-inner flex-column justify-content-center rbt-gap--8 align-items-center text-center">
                                            <div className="rbt-banner-content">
                                              <h5 className="title">
                                                {cat.banner.title}
                                              </h5>
                                              <p className="b3 desc">
                                                {cat.banner.desc}
                                              </p>
                                            </div>
                                            {cat.banner.btnHref.startsWith(
                                              "http"
                                            ) || cat.banner.btnHref === "#" ? (
                                              <a
                                                className="rbt-btn rbt-btn-sm rbt-btn-black"
                                                href={cat.banner.btnHref}
                                              >
                                                {cat.banner.btnText}
                                              </a>
                                            ) : (
                                              <Link
                                                className="rbt-btn rbt-btn-sm rbt-btn-black"
                                                href={cat.banner.btnHref}
                                              >
                                                {cat.banner.btnText}
                                              </Link>
                                            )}
                                            <a
                                              href="#"
                                              className="product-img position-bottom mt--24"
                                            >
                                              <Image
                                                alt="Ecommerce Product"
                                                src={cat.banner.imgSrc}
                                                width={cat.banner.imgWidth}
                                                height={cat.banner.imgHeight}
                                              />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* End Mega Menu  */}
                          </li>
                        );
                      })}
                      {categorySimpleLinks.map((link) => (
                        <li key={link.label}>
                          <Link href={link.href}>
                            <span>
                              <i
                                className={`rbt-categories-icon mr--8 ${link.icon}`}
                              />
                            </span>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={CATEGORIES_PAGE_PATH}>
                          View All Categories
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mobile-menu-bottom">
          <div className="social-share-wrapper">
            <span className="rbt-short-title d-block">Find With Us</span>
            <ul className="rbt-social-icon-list mt--12">
              {mobileMenuSocialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <i className={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="navbar-top-left rbt-information-list justify-content-center">
            <li>
              <a href={contactInfo.emailHref}>
                <i className="fa-light fa-envelope" />
                {contactInfo.email}
              </a>
            </li>
            <li>
              <a href={contactInfo.phoneHref}>
                <i className="fa-regular fa-phone" />
                {contactInfo.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
