import type { SiteSeedData } from "./types.js";

export const generalSeedData: SiteSeedData = {
  label: "general",
  primaryCategorySlug: "essentials",
  primaryBrandSlug: "core-home",
  categories: [
    {
      name: "Essentials",
      slug: "essentials",
      image: "/assets/images/catagory-img/cat-transp-img-01.webp",
      status: "published",
    },
    {
      name: "Home",
      slug: "home",
      image: "/assets/images/catagory-img/cat-transp-img-02.webp",
      status: "published",
    },
    {
      name: "Accessories",
      slug: "accessories",
      image: "/assets/images/catagory-img/cat-transp-img-03.webp",
      status: "published",
    },
  ],
  brands: [
    {
      name: "Core Home",
      slug: "core-home",
      website: "corehome.com",
      initials: "CH",
      tileClass: "bg-brand-50 text-brand-600",
      visibility: "Featured",
      status: "published",
    },
    {
      name: "Everyday Co",
      slug: "everyday-co",
      website: "everydayco.com",
      initials: "EC",
      tileClass: "bg-success-50 text-success-600",
      visibility: "Standard",
      status: "published",
    },
  ],
  attributes: [
    {
      name: "Material",
      slug: "material",
      displayType: "Dropdown",
      description: "Primary product material.",
      status: "published",
      values: ["Cotton", "Metal", "Plastic"],
    },
  ],
  products: [
    {
      name: "Everyday Utility Mug",
      slug: "everyday-utility-mug",
      sku: "GN-ES-001",
      description: "Ceramic mug for daily use.",
      price: 18,
      stock: 140,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-05.webp",
      ],
      attributes: { material: "Plastic" },
    },
    {
      name: "Soft Cotton Throw",
      slug: "soft-cotton-throw",
      sku: "GN-HM-002",
      description: "Lightweight throw blanket.",
      price: 45,
      stock: 36,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-06.webp",
      ],
      attributes: { material: "Cotton" },
    },
    {
      name: "Desk Organizer Set",
      slug: "desk-organizer-set",
      sku: "GN-AC-003",
      description: "Metal desk organizer with three compartments.",
      price: 29,
      stock: 48,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-07.webp",
      ],
      attributes: { material: "Metal" },
    },
  ],
};
