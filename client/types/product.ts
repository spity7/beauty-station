// Product Badge Type
export interface ProductBadge {
  text: string;
  bg?: string;
  position?: string;
  className?: string;
}

// Product Variant Types
export interface ProductVariant {
  src?: string;
  color?: string;
  hex?: string;
  tooltip?: string;
  active?: boolean;
  imgSrc?: string;
}

export interface ColorVariant {
  color: string;
  src: string;
  tooltip: string;
}

// Extra Info Type
export interface ExtraInfo {
  icon: string;
  text: string;
}

// Pricing Badge Type
export interface PricingBadge {
  text: string | number;
  bg: string;
}

// Product Detail Type
export interface ProductDetail {
  label: string;
  text: string | string[];
}

// Shipment Detail Type
export interface ShipmentDetail {
  icon: string;
  label: string;
  text: string | null;
  link?: {
    href: string;
    text: string;
  };
}

// Countdown Type
export interface Countdown {
  date: string;
}

// Quantity Area Type
export interface QuantityArea {
  text: string | number;
  progress: number;
}

// Frame Slide Type
export interface FrameSlide {
  id?: number;
  imgSrc?: string;
  src?: string;
  imgAlt?: string;
  badges?: ProductBadge[];
  active?: boolean;
}

// Main Product Type
export interface Product {
  // Core Fields
  id: number | string;
  title: string;
  price: number;
  imgSrc: string;

  // Optional Core Fields
  oldPrice?: number | null;
  category?: string[];
  rating?: number;
  ratingCount?: number;
  reviewCount?: number;

  // Badge Fields
  badge?: ProductBadge | null;
  badges?: ProductBadge[];

  // Image Fields
  hoverImgSrc?: string | null;
  hoverImg?: string;
  hoverVideoSrc?: string | null;

  // Pricing Fields
  discount?: number | null;
  discountPercentage?: number | null;
  priceRange?: string[];

  // Variant Fields
  variants?: ProductVariant[];
  colorVariants?: ColorVariant[];

  // UI Display Fields
  showTruckIcon?: boolean;
  hotSell?: boolean;
  moreText?: number;
  moreItemsLink?: number;
  moreVariantsText?: number;

  // Electronics Specific Fields
  extraInfo?: ExtraInfo[];
  pricingBadges?: PricingBadge[];
  productDetails?: ProductDetail[];
  shipmentDetails?: ShipmentDetail[];
  inStock?: boolean;
  availableQuantity?: number;
  filterBrands?: string[];
  filterCategory?: string[];
  filterColor?: string[];
  filterSizes?: string[];
  services?: string[];
  tags?: string[];
  isStockOut?: boolean;
  watchingTooltip?: number | null;
  countdown?: Countdown | null;
  quantityArea?: QuantityArea;
  listViewVariation?: string;

  // Lookbook Specific Fields
  bannerId?: number;
  bannerImg?: string;
  top?: number;
  left?: number;
  contentPosition?: string;
  animation?: string;
  bannerAnimation?: string;
  vertical?: number;
  horizontal?: number;
  placement?: string;

  // Book/Product Slide Fields
  subtitle?: string;
  titleSub?: string;

  // Compare Product Fields
  soldBy?: string;
  color?: string;
  fitType?: string;
  dimensions?: string;
  features?: string;

  // Image Dimension Fields
  width?: number;
  height?: number;
  imgWidth?: number;
  imgHeight?: number;

  // Bundle/Combo Fields
  quantity?: number;
  iconClass?: string;

  // Frame/Slide Fields
  frameSlides?: FrameSlide[];

  // Additional Optional Fields
  position?: string;

  // Demo / Tab Filtering
  demoTab?: string[];

  /** MongoDB product id when loaded from API (cart/checkout). */
  apiProductId?: string;

  /** Full gallery when loaded from API. */
  images?: string[];
  brandName?: string;
  description?: string;
  attributes?: Record<string, string | string[]>;
}

// Cart item: Product with required quantity
export interface CartProduct extends Product {
  quantity: number;
  /** Server cart line id (`/api/cart/items/:itemId`). */
  serverCartItemId?: string;
}
