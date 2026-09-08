import type { CategoryDto } from "@platform/shared";

export type StorefrontCategoryItem = {
  href: string;
  id: string;
  image: string;
  name: string;
};

const PLACEHOLDER_CATEGORY_IMAGE =
  "/assets/images/catagory-img/cat-img-rounded-c-01.webp";

export function mapCategoryDtoToStorefront(
  category: CategoryDto
): StorefrontCategoryItem {
  return {
    id: category.id,
    name: category.name,
    image: category.image || PLACEHOLDER_CATEGORY_IMAGE,
    href: `/shop?categoryId=${category.id}`,
  };
}

export function mapCategoryDtosToStorefront(
  categories: CategoryDto[]
): StorefrontCategoryItem[] {
  return categories.map(mapCategoryDtoToStorefront);
}
