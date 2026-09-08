import Link from "next/link";
import Image from "next/image";
import { categories14 } from "@/data/categories";
import {
  loadPublishedCategories,
  type StorefrontCategoryItem,
} from "@/lib/catalog";

function toFallbackCategories(): StorefrontCategoryItem[] {
  return categories14.map((category, index) => ({
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
  containerFull = false,
}: {
  containerFull?: boolean;
}) {
  const categories = await loadCategories();

  return (
    <div className="rbt-component-area rbt-categories-area pt--0 pt_sm--16 pt_md--16 rbt-bg-color-white">
      <div
        className={`${containerFull ? "rbt-full-width-wrapper" : "container"}`}
      >
        <div className="row row--12 align-items-end">
          {categories.map((category, index) => (
            <div
              className="col-lg-1-8 col-md-3 col-sm-3 col-3 mt--12"
              key={category.id}
            >
              <Link
                className={`rbt-cat-box rbt-cat-box-1 text-center rbt-scroll-trigger fade_in animation-order-${
                  index + 1
                }`}
                href={category.href}
              >
                <div className="inner">
                  <div className="rbt-image-portion">
                    {category.image ? (
                      <Image
                        alt={category.name}
                        height={400}
                        src={category.image}
                        width={400}
                      />
                    ) : null}
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
