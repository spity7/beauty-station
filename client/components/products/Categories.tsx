import Link from "next/link";
import { StorefrontCategoryGrid } from "@/components/catalog/StorefrontCategoryGrid";
import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import {
  loadPublishedCategories,
  type StorefrontCategoryItem,
} from "@/lib/catalog";

async function loadCategories(): Promise<StorefrontCategoryItem[]> {
  return loadPublishedCategories(12);
}

function categoriesStripTopSpacing(productionStrip: boolean) {
  return productionStrip
    ? "pt--40 pt_md--32 pt_sm--20"
    : "pt--0 pt_sm--16 pt_md--16";
}

export default async function Categories({
  containerFull = false,
  productionStrip = false,
}: {
  containerFull?: boolean;
  productionStrip?: boolean;
}) {
  const categories = await loadCategories();

  if (categories.length === 0) {
    if (!productionStrip) {
      return null;
    }
    return (
      <div
        className={`rbt-component-area rbt-categories-area ${categoriesStripTopSpacing(productionStrip)} rbt-bg-color-white`}
      >
        <div className={containerFull ? "rbt-full-width-wrapper" : "container"}>
          <p className="mb--0 text-center rbt-text-color-body">
            No categories to show yet.{" "}
            <Link className="rbt-btn-link" href={CATEGORIES_PAGE_PATH}>
              View categories
            </Link>{" "}
            or{" "}
            <Link className="rbt-btn-link" href="/shop">
              browse the shop
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rbt-component-area rbt-categories-area rbt-categories-area--large-circles ${categoriesStripTopSpacing(productionStrip)} rbt-bg-color-white`}
    >
      <div
        className={`${containerFull ? "rbt-full-width-wrapper" : "container"}`}
      >
        <StorefrontCategoryGrid categories={categories} layout="compact" />
      </div>
    </div>
  );
}
