import { roundedCategories } from "@/data/categories";
import {
  loadPublishedCategories,
  type StorefrontCategoryItem,
} from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

function toFallbackCategories(): StorefrontCategoryItem[] {
  return roundedCategories.map((category, index) => ({
    id: String(index),
    name: category.title ?? "Category",
    image: category.imgSrc ?? "",
    href: "/shop-by-categories",
  }));
}

async function loadCategories(): Promise<StorefrontCategoryItem[]> {
  const categories = await loadPublishedCategories(12);
  return categories.length > 0 ? categories : toFallbackCategories();
}

export default async function Categories({
  sectionSpace,
}: {
  sectionSpace?: string;
}) {
  const categories = await loadCategories();

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
              href={`/categories-list`}
            >
              <span className="btn-text">View All Categories</span>
              <span className="btn-icon ml--4">
                <i className="fa-sharp fa-solid fa-arrow-up-right-from-square" />
              </span>
            </Link>
          </div>
        </div>
        <div className="row row--12 mt_dec--16 align-items-end">
          {categories.map((category, index) => (
            <div
              className="col-lg-2 col-md-4 col-sm-4 col-4 mt--16"
              key={category.id}
            >
              <Link
                className={`rbt-cat-box rbt-cat-box-1 rbt-cat-box-1-rounded text-center rbt-scroll-trigger fade_in animation-order-${index + 1}`}
                href={category.href}
              >
                <div className="inner">
                  <div className="rbt-image-portion rbt-bg-color-brand-100">
                    <Image
                      alt={category.name}
                      className="object-fit-cover"
                      fill
                      sizes="(max-width: 576px) 25vw, (max-width: 992px) 16vw, 12vw"
                      src={category.image}
                    />
                  </div>
                  <div className="content">
                    <h6 className="title">{category.name}</h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
