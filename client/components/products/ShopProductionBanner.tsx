import Link from "next/link";
import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import { getStorefrontSiteConfig } from "@/lib/site";

export default function ShopProductionBanner({
  containerFull = false,
}: {
  containerFull?: boolean;
}) {
  const site = getStorefrontSiteConfig();

  return (
    <div className="rbt-component-area rbt-page-banner-content">
      <div
        className={`${containerFull ? "rbt-full-width-wrapper" : "container"}`}
      >
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-banner radius-8 rbt-scroll-trigger fade_in animation-order-1">
              <div className="mega-top-banner bg-three">
                <div className="rbt-banner-inner w-100">
                  <div className="rbt-banner-content">
                    <h5 className="title">
                      Discover the {site.name} collection
                    </h5>
                    <p className="b3 desc">
                      Browse published products, filter by category or brand,
                      and shop with your live catalog.
                    </p>
                  </div>
                  <div className="pricing-action d-flex align-items-center rbt-gap--8">
                    <Link
                      className="rbt-btn rbt-btn-sm rbt-btn-black"
                      href="/shop"
                    >
                      Shop all
                    </Link>
                    <Link
                      className="rbt-btn rbt-btn-sm rbt-btn-border"
                      href={CATEGORIES_PAGE_PATH}
                    >
                      Categories
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
