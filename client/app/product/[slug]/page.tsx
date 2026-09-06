import BottomStickyProduct from "@/components/product-details/others/BottomStickyProduct";
import BreadCrumb from "@/components/product-details/BreadCrumb";
import Description4 from "@/components/product-details/descriptions/Description4";
import DetailsCosmetic from "@/components/product-details/details/DetailsCosmetic";
import SimillerProducts4 from "@/components/product-details/others/SimillerProducts4";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { allProducts } from "@/data/products";
import { cosmeticProducts } from "@/data/products/beauty";
import { mapProductDtoToStorefront } from "@/lib/mappers/product";
import { getStorefrontSiteConfig } from "@/lib/site";
import { fetchProductBySlug } from "@platform/api-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";

const site = getStorefrontSiteConfig();

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadProduct(slug: string): Promise<Product | null> {
  try {
    const dto = await fetchProductBySlug(slug);
    if (dto) {
      return mapProductDtoToStorefront(dto);
    }
  } catch {
    // fallback below
  }

  const staticMatch =
    cosmeticProducts.find((p) => String(p.id) === slug) ??
    allProducts.find((p) => String(p.id) === slug);
  return staticMatch ?? null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) {
    return { title: `Product | ${site.seo.title}` };
  }
  return {
    title: `${product.title} | ${site.seo.title}`,
    description: site.seo.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <StorefrontChrome>
      <BreadCrumb product={product} />
      <DetailsCosmetic product={product} />
      <Description4 description={product.description} />
      <SimillerProducts4 />
      <BottomStickyProduct />
    </StorefrontChrome>
  );
}
