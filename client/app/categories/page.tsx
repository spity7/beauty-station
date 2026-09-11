import Breadcrumb from "@/components/products/Breadcrumb";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import StorefrontAllCategoriesGrid from "@/components/store/StorefrontAllCategoriesGrid";
import { getStorefrontSiteConfig } from "@/lib/site";
import type { Metadata } from "next";

const site = getStorefrontSiteConfig();

export const metadata: Metadata = {
  title: `Categories | ${site.seo.title}`,
  description: site.seo.description,
};

export default function CategoriesPage() {
  return (
    <StorefrontChrome>
      <Breadcrumb title="Categories" />
      <div className="rbt-component-area ptb--32 ptb_sm--16 rbt-bg-color-white">
        <div className="container">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
            <h1 className="rbt-title mb--0">Shop by category</h1>
            <p className="b1 rbt-text-color-gray-600 mb--0 mt--8">
              Browse our catalog and find products in every category.
            </p>
          </div>
        </div>
      </div>
      <StorefrontAllCategoriesGrid />
    </StorefrontChrome>
  );
}
