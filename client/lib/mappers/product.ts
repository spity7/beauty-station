import type { ProductDto } from "@platform/shared";
import type { Product } from "@/types/product";

const DEFAULT_PRODUCT_IMAGE =
  "/assets/images/product-img/beauty-product/beauty-product-st-05.webp";

export function mapProductDtoToStorefront(product: ProductDto): Product {
  const images =
    product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];

  return {
    id: product.slug,
    apiProductId: product.id,
    title: product.name,
    price: product.price,
    imgSrc: images[0],
    images,
    oldPrice: product.compareAtPrice ?? null,
    category: product.categoryName ? [product.categoryName] : [],
    brandName: product.brandName || undefined,
    description: product.description || undefined,
    attributes: product.attributes,
    inStock: product.stock > 0,
    availableQuantity: product.stock,
    isStockOut: product.stock <= 0,
    rating: 5,
    ratingCount: 0,
  };
}

export function mapProductDtosToStorefront(products: ProductDto[]): Product[] {
  return products.map(mapProductDtoToStorefront);
}
