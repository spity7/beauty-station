import { StorefrontCategoryGrid } from "@/components/catalog/StorefrontCategoryGrid";
import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import { loadStorefrontCategories } from "@/lib/catalog";
import Link from "next/link";

export default async function Categories({
  sectionSpace,
}: {
  sectionSpace?: string;
}) {
  const categories = await loadStorefrontCategories(12, { useFallback: true });

  return (
    <div
      className={`rbt-component-area rbt-categories-area rbt-categories-area--large-circles rbt-bg-color-white ${sectionSpace ? sectionSpace : "rbt-section-gapTop"}`}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex justify-content-between flex-row align-items-end mb--32 flex-wrap rbt-gap--16">
            <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
              <h4 className="rbt-title rbt-scroll-trigger fade_in animation-order-1">
                Popular by <span className="rbt-bold--text">Categories</span>
              </h4>
            </div>
            <Link
              className="rbt-btn rbt-btn-secondary rbt-btn-sm-2 rbt-scroll-trigger fade_in animation-order-2"
              href={CATEGORIES_PAGE_PATH}
            >
              <span className="btn-text">View All Categories</span>
              <span className="btn-icon ml--4">
                <i className="fa-sharp fa-solid fa-arrow-up-right-from-square" />
              </span>
            </Link>
          </div>
        </div>
        <StorefrontCategoryGrid categories={categories} />
      </div>
    </div>
  );
}
