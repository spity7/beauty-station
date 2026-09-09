import BottomStickyProduct from "@/components/product-details/others/BottomStickyProduct";
import BreadCrumb from "@/components/product-details/BreadCrumb";
import Description4 from "@/components/product-details/descriptions/Description4";
import DetailsCosmetic from "@/components/product-details/details/DetailsCosmetic";
import SimillerProducts4 from "@/components/product-details/others/SimillerProducts4";
import { StorefrontChrome } from "@/components/site/StorefrontChrome";
import { mapProductDtoToStorefront } from "@/lib/mappers/product";
import { getStorefrontSiteConfig } from "@/lib/site";
import { fetchProductBySlug } from "@platform/api-client";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";

const site = getStorefrontSiteConfig();

type PageProps = {
  params: Promise<{ slug: string }>;
};

type LoadProductResult =
  | { kind: "found"; product: Product }
  | { kind: "unavailable" }
  | { kind: "missing" };

async function loadProduct(slug: string): Promise<LoadProductResult> {
  try {
    const dto = await fetchProductBySlug(slug);
    if (dto) {
      return { kind: "found", product: mapProductDtoToStorefront(dto) };
    }
    return { kind: "unavailable" };
  } catch {
    return { kind: "missing" };
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadProduct(slug);
  if (result.kind !== "found") {
    return { title: `Product | ${site.seo.title}` };
  }
  return {
    title: `${result.product.title} | ${site.seo.title}`,
    description: site.seo.description,
  };
}

function ProductUnavailable() {
  return (
    <StorefrontChrome>
      <div className="rbt-component-area rbt-section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="title mb--16">Product unavailable</h1>
              <p className="description mb--24">
                This product is no longer available on the storefront. It may be
                unpublished, archived, or removed from the catalog.
              </p>
              <Link className="rbt-btn" href="/shop">
                Back to shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StorefrontChrome>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await loadProduct(slug);

  if (result.kind === "unavailable") {
    return <ProductUnavailable />;
  }

  if (result.kind === "missing") {
    notFound();
  }

  const product = result.product;

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
