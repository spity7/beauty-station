import type { SiteSeedData } from "./types.js";

export const sportSeedData: SiteSeedData = {
  label: "sport",
  primaryCategorySlug: "training",
  primaryBrandSlug: "active-pro",
  categories: [
    {
      name: "Training",
      slug: "training",
      image: "/assets/images/catagory-img/cat-transp-img-01.webp",
      status: "published",
    },
    {
      name: "Running",
      slug: "running",
      image: "/assets/images/catagory-img/cat-transp-img-02.webp",
      status: "published",
    },
    {
      name: "Outdoor",
      slug: "outdoor",
      image: "/assets/images/catagory-img/cat-transp-img-03.webp",
      status: "published",
    },
  ],
  brands: [
    {
      name: "Active Pro",
      slug: "active-pro",
      website: "activepro.com",
      initials: "AP",
      tileClass: "bg-brand-50 text-brand-600",
      visibility: "Featured",
      status: "published",
    },
    {
      name: "Trail Forge",
      slug: "trail-forge",
      website: "trailforge.com",
      initials: "TF",
      tileClass: "bg-success-50 text-success-600",
      visibility: "Standard",
      status: "published",
    },
  ],
  attributes: [
    {
      name: "Size",
      slug: "size",
      displayType: "Dropdown",
      description: "Apparel and gear size.",
      status: "published",
      values: ["S", "M", "L", "XL"],
    },
    {
      name: "Activity",
      slug: "activity",
      displayType: "Dropdown",
      description: "Primary sport or activity.",
      status: "published",
      values: ["Gym", "Running", "Hiking"],
    },
  ],
  products: [
    {
      name: "Performance Training Tee",
      slug: "performance-training-tee",
      sku: "SP-TR-001",
      description: "Breathable tee for high-intensity workouts.",
      price: 32,
      stock: 90,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-05.webp",
      ],
      attributes: { size: "M", activity: "Gym" },
    },
    {
      name: "Lightweight Running Shorts",
      slug: "lightweight-running-shorts",
      sku: "SP-RN-002",
      description: "Quick-dry shorts with inner lining.",
      price: 28,
      stock: 55,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-06.webp",
      ],
      attributes: { size: "L", activity: "Running" },
    },
    {
      name: "Trail Grip Backpack",
      slug: "trail-grip-backpack",
      sku: "SP-OD-003",
      description: "20L pack with weather-resistant shell.",
      price: 74,
      stock: 24,
      status: "published",
      images: [
        "/assets/images/product-img/beauty-product/beauty-product-st-07.webp",
      ],
      attributes: { activity: "Hiking" },
    },
  ],
};
