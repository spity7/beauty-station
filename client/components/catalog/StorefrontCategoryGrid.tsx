import type { StorefrontCategoryItem } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

type StorefrontCategoryGridProps = {
  categories: StorefrontCategoryItem[];
  showProductCount?: boolean;
};

export function StorefrontCategoryGrid({
  categories,
  showProductCount = false,
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
