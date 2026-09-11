import { StorefrontCategoryGrid } from "@/components/catalog/StorefrontCategoryGrid";
import Breadcrumb from "@/components/products/Breadcrumb";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { loadStorefrontCategories } from "@/lib/catalog";
import { getStorefrontSiteConfig } from "@/lib/site";
import type { Metadata } from "next";

const site = getStorefrontSiteConfig();

export const metadata: Metadata = {
  title: `Categories | ${site.seo.title}`,
  description: `Browse all product categories at ${site.name}.`,
};

export default async function CategoriesPage() {
  const categories = await loadStorefrontCategories();

  return (
    <StorefrontChrome>
      <Breadcrumb title="Categories" />
      <div className="rbt-component-area rbt-categories-area rbt-categories-area--large-circles rbt-section-gapBottom rbt-bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb--32">
              <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
                <h1 className="rbt-title mb--0">
                  All <span className="rbt-bold--text">Categories</span>
                </h1>
              </div>
            </div>
          </div>
          <StorefrontCategoryGrid categories={categories} showProductCount />
        </div>
      </div>
    </StorefrontChrome>
  );
}
