import type { StorefrontCategoryItem } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

const COLUMN_CLASS_BY_LAYOUT = {
  /** 6 categories per row on large screens (homepage default). */
  default: "col-lg-2 col-md-4 col-sm-4 col-4 mt--16",
  /** Shop strip: 4 → 6 → 6 → 10 → 12 categories per row by breakpoint. */
  compact: "col-xxl-1-12 col-lg-1-10 col-md-2 col-sm-2 col-3 mt--16",
} as const;

const IMAGE_SIZES_BY_LAYOUT = {
  default: "(max-width: 576px) 25vw, (max-width: 992px) 16vw, 12vw",
  compact: "(max-width: 576px) 25vw, (max-width: 1199px) 16vw, 10vw",
} as const;

type StorefrontCategoryGridProps = {
  categories: StorefrontCategoryItem[];
  showProductCount?: boolean;
  layout?: keyof typeof COLUMN_CLASS_BY_LAYOUT;
};

export function StorefrontCategoryGrid({
  categories,
  showProductCount = false,
  layout = "default",
}: StorefrontCategoryGridProps) {
  if (categories.length === 0) {
    return (
      <p className="mb--0 text-center">
        No categories are available yet.{" "}
        <Link href="/shop" className="rbt-btn-link">
          Browse the shop
        </Link>
      </p>
    );
  }

  return (
    <div className="row row--12 mt_dec--16 align-items-end">
      {categories.map((category, index) => (
        <div className={COLUMN_CLASS_BY_LAYOUT[layout]} key={category.id}>
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
                  sizes={IMAGE_SIZES_BY_LAYOUT[layout]}
                  src={category.image}
                />
              </div>
              <div className="content">
                <h6 className="title">{category.name}</h6>
                {showProductCount && category.productCount != null ? (
                  <span className="subtitle">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
