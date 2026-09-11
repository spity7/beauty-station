import { routes } from "@/config/routes";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const primaryNavigation: Array<NavigationGroup | NavigationItem> = [
  {
    icon: "layout-dashboard",
    key: "dashboard",
    label: "Dashboard",
    href: routes.dashboard,
  },
  {
    children: [
      {
        href: routes.products,
        key: "products",
        label: "Products",
      },
      {
        href: routes.addProduct,
        key: "add-product",
        label: "Add New Product",
      },
    ],
    icon: "store",
    key: "product",
    label: "Product",
  },
  {
    children: [
      {
        href: routes.categories,
        key: "categories",
        label: "Category List",
      },
      {
        href: routes.addCategory,
        key: "add-category",
        label: "Add New Category",
      },
    ],
    icon: "list-tree",
    key: "category",
    label: "Category",
  },
  {
    children: [
      {
        href: routes.brands,
        key: "brands",
        label: "Brand List",
      },
      {
        href: routes.addBrand,
        key: "add-brand",
        label: "Add New Brand",
      },
    ],
    feature: "brands",
    icon: "star",
    key: "brand",
    label: "Brand",
  },
  {
    children: [
      {
        href: routes.attributes,
        key: "attributes",
        label: "Attributes",
      },
      {
        href: routes.addAttribute,
        key: "add-attribute",
        label: "Add Attributes",
      },
    ],
    feature: "attributes",
    icon: "sliders-horizontal",
    key: "attributes",
    label: "Attributes",
  },
  {
    children: [
      {
        href: routes.customers,
        key: "customers",
        label: "All Users",
      },
      {
        href: routes.addUser,
        key: "add-user",
        label: "Add New User",
      },
    ],
    icon: "users",
    key: "users",
    label: "Users",
  },
  {
    children: [
      {
        href: routes.roles,
        key: "roles",
        label: "All Roles",
      },
      {
        href: routes.createRole,
        key: "create-role",
        label: "Create Role",
      },
    ],
    icon: "shield-check",
    key: "roles",
    label: "Roles",
  },
  {
    href: routes.media,
    icon: "image",
    key: "media",
    label: "Media",
  },
  {
    children: [
      {
        href: routes.orders,
        key: "orders",
        label: "Order List",
      },
      {
        href: routes.addOrder,
        key: "add-order",
        label: "Add Order",
      },
    ],
    icon: "shopping-bag",
    key: "orders",
    label: "Orders",
  },
  {
    children: [
      {
        href: routes.translation,
        key: "translation",
        label: "Translation",
      },
      {
        href: routes.currencyRates,
        key: "currency-rates",
        label: "Currency Rates",
      },
    ],
    icon: "globe",
    key: "localization",
    label: "Localization",
  },
  {
    children: [
      {
        href: routes.coupons,
        key: "coupons",
        label: "Coupon List",
      },
      {
        href: routes.addCoupon,
        key: "add-coupon",
        label: "Create Coupon",
      },
    ],
    feature: "coupons",
    icon: "badge-percent",
    key: "coupons",
    label: "Coupons",
  },
  {
    href: routes.tax,
    icon: "receipt",
    key: "tax",
    label: "Tax",
  },
  {
    feature: "reviews",
    href: routes.productReviews,
    icon: "star",
    key: "product-reviews",
    label: "Product Reviews",
  },
  {
    href: routes.supportTickets,
    icon: "life-buoy",
    key: "support-tickets",
    label: "Support Tickets",
  },
  {
    children: [
      {
        href: routes.settings,
        key: "settings",
        label: "Store Profile",
      },
      {
        href: routes.shippingSettings,
        key: "shipping-settings",
        label: "Shipping",
      },
      {
        href: routes.paymentSettings,
        key: "payment-settings",
        label: "Payments",
      },
      {
        href: routes.permissionSettings,
        key: "permission-settings",
        label: "Permissions",
      },
      {
        href: routes.notifications,
        key: "notifications",
        label: "Notifications",
      },
    ],
    icon: "settings",
    key: "settings",
    label: "Settings",
  },
  {
    href: routes.reports,
    icon: "bar-chart-3",
    key: "reports",
    label: "Reports",
  },
  {
    href: routes.listPage,
    icon: "list",
    key: "list-page",
    label: "List Page",
  },
  {
    href: routes.integrations,
    icon: "folder",
    key: "integrations",
    label: "Integrations",
  },
  {
    href: routes.history,
    icon: "history",
    key: "history",
    label: "History",
  },
  {
    href: routes.updateApp,
    icon: "refresh-ccw",
    key: "update-app",
    label: "Update App",
  },
];
