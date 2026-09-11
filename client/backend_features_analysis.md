# Backend API Feature Breakdown — Beauty Station

> **Status (2026-09-11):** **Roadmap / planning doc** — not all endpoints below exist. **Implemented today:** catalog CRUD + product list filters (`search`, `sort`, `minPrice`, `maxPrice`; anonymous catalog GET rate-limited), auth with refresh revocation + rate limits + password reset + email verification (sent on register) + Google social sign-in (profile photo import), user profile (`GET /api/users/me`) + avatar URL + soft-delete account (password or Google `idToken`), OAuth set-password flow, saved addresses, cart, **wishlist** (auth-only API + storefront sync when `features.wishlist`), orders (place requires verified email; customer cancel before shipped), **admin users** (`GET /api/admin/users`, `PATCH /api/admin/users/:id/status`), `/api/uploads`, `/api/health`. **Admin:** catalog CRUD + orders + **customers list (API)**. Storefront: `/shop` URL-driven API filters/search, header search → `/shop?search=`, customer auth, checkout, order history/detail with cancel, account pages. Client wishlist unit tests: `npm run test -w @platform/storefront`.

> **Stack context:** Next.js App Router storefront + Express API monorepo. Static mock data remains in `client/data/` for theme demos.

---

## 1. Authentication & User Management

### 1.1 Auth

- `POST /api/auth/register` — Register with email/password (name, email, password, phone)
- `POST /api/auth/login` — Login, return JWT + refresh token (rate-limited)
- `POST /api/auth/logout` — Invalidate refresh token (`refreshTokenVersion` bump)
- `POST /api/auth/refresh` — Refresh access token (validates `tokenVersion`; rate-limited)
- `POST /api/auth/forgot-password` — Request password reset link (emailed when SMTP configured; dev logs link token when unset)
- `POST /api/auth/reset-password` — Reset with link token + new password
- `POST /api/auth/verify-email` — Verify email via link token _(implemented)_
- `POST /api/auth/social` — Google OAuth sign-in _(implemented)_

### 1.2 User Profile

- `GET /api/users/me` — Get current user profile _(implemented)_
- `PATCH /api/users/me` — Update name, phone, avatar _(implemented)_
- `PATCH /api/users/me/password` — Change password
- `DELETE /api/users/me` — Soft-delete account (14-day reactivation) _(implemented)_
- `GET /api/users/me/addresses` — List saved addresses
- `POST /api/users/me/addresses` — Add address
- `PATCH /api/users/me/addresses/:id` — Update address
- `DELETE /api/users/me/addresses/:id` — Delete address
- `PATCH /api/users/me/addresses/:id/default` — Set default address

---

## 2. Product Catalog

### 2.1 Products

- `GET /api/products` — List products with query params:
  - `page`, `limit`, `sort` (price_asc, price_desc, title_asc, title_desc, newest) _(sort + min/max price implemented)_
  - `minPrice`, `maxPrice` _(implemented)_
  - `brands[]`, `categories[]`, `colors[]`, `sizes[]`
  - `tags[]`, `services[]`, `ratings[]`
  - `onSale`, `inStock`
  - `search` — full-text search
- `GET /api/products/:id` — Single product detail
- `GET /api/products/:id/related` — Related/recommended products
- `GET /api/products/:id/reviews` — Product reviews
- `POST /api/products` — Create product _(admin)_
- `PATCH /api/products/:id` — Update product _(admin)_
- `DELETE /api/products/:id` — Delete product _(admin)_

### 2.2 Product Variants

- `GET /api/products/:id/variants` — List variants (color, size combinations)
- `POST /api/products/:id/variants` — Add variant _(admin)_
- `PATCH /api/products/:id/variants/:variantId` — Update variant _(admin)_
- `DELETE /api/products/:id/variants/:variantId` — Delete variant _(admin)_

### 2.3 Product Images

- `POST /api/products/:id/images` — Upload images _(admin)_
- `DELETE /api/products/:id/images/:imageId` — Remove image _(admin)_
- `PATCH /api/products/:id/images/:imageId/primary` — Set primary image _(admin)_

### 2.4 Inventory

- `GET /api/products/:id/inventory` — Get stock levels _(admin)_
- `PATCH /api/products/:id/inventory` — Update stock count _(admin)_
- `POST /api/products/:id/inventory/adjust` — Adjust by delta _(admin)_

---

## 3. Categories

- `GET /api/categories` — List all categories (supports `tree` param for nested)
- `GET /api/categories/:slug` — Single category with products
- `GET /api/categories/:slug/children` — Subcategories
- `POST /api/categories` — Create _(admin)_
- `PATCH /api/categories/:id` — Update _(admin)_
- `DELETE /api/categories/:id` — Delete _(admin)_

---

## 4. Brands

- `GET /api/brands` — List brands (with `productCount`, `location`, `logo`)
- `GET /api/brands/:slug` — Brand detail + products
- `POST /api/brands` — Create _(admin)_
- `PATCH /api/brands/:id` — Update _(admin)_
- `DELETE /api/brands/:id` — Delete _(admin)_

---

## 5. Shopping Cart

> Cart can be user-scoped (DB) or session-scoped (guest). Needs merge on login.

### 5.1 Cart CRUD

- `GET /api/cart` — Get current cart (auth or guest via session token)
- `POST /api/cart/items` — Add item `{ productId, variantId?, quantity }`
- `PATCH /api/cart/items/:itemId` — Update quantity
- `DELETE /api/cart/items/:itemId` — Remove item
- `DELETE /api/cart` — Clear entire cart

### 5.2 Cart Utilities

- `POST /api/cart/merge` — Merge guest cart into user cart on login
- `POST /api/cart/coupon` — Apply coupon code
- `DELETE /api/cart/coupon` — Remove coupon
- `GET /api/cart/shipping-estimate` — Estimate shipping cost by zip/city

### 5.3 Shareable Cart

- `POST /api/cart/share` — Generate shareable cart link token
- `GET /api/cart/share/:token` — Load shared cart

---

## 6. Wishlist _(implemented)_

- `GET /api/wishlist` — Get user wishlist _(implemented)_
- `POST /api/wishlist/items` — Add product `{ productId }` _(implemented)_
- `DELETE /api/wishlist/items/:productId` — Remove product _(implemented)_
- `DELETE /api/wishlist` — Clear wishlist _(implemented)_
- `POST /api/wishlist/move-to-cart` — Move item to cart `{ productId }` _(implemented on server; storefront uses add-to-cart only — wishlist and cart stay independent)_

---

## 7. Orders & Checkout

### 7.1 Checkout Session

- `POST /api/checkout/session` — Initialize checkout session, validate cart, lock stock
- `GET /api/checkout/session/:id` — Get checkout state
- `PATCH /api/checkout/session/:id/shipping` — Set shipping address + method
- `PATCH /api/checkout/session/:id/payment` — Set payment method
- `POST /api/checkout/session/:id/confirm` — Place order

### 7.2 Shipping Methods

- `GET /api/shipping/methods` — List available shipping methods (Courier, Pickup)
- `GET /api/shipping/time-slots` — Available delivery time slots for a date

### 7.3 Orders

- `GET /api/orders` — User order history (paginated)
- `GET /api/orders/:id` — Order detail (items, status, tracking)
- `POST /api/orders/:id/cancel` — Cancel order (if not shipped) _(implemented for customer owner; pending/processing only)_
- `GET /api/orders/:id/invoice` — Download invoice PDF

### 7.4 Order Returns

- `POST /api/orders/:id/return` — Request return/refund
- `GET /api/orders/:id/return` — Return status
- `PATCH /api/orders/:id/return` — Update return _(admin)_

### 7.5 Admin Order Management

- `GET /api/admin/orders` — All orders with filters (status, date, user) _(admin)_
- `PATCH /api/admin/orders/:id/status` — Update order status _(admin)_
- `POST /api/admin/orders/:id/tracking` — Add tracking number _(admin)_

---

## 8. Payments

### 8.1 Payment Processing

- `POST /api/payments/intent` — Create payment intent (Stripe/etc.), return `clientSecret`
- `POST /api/payments/confirm` — Confirm payment, attach to order
- `POST /api/payments/webhook` — Stripe webhook handler (payment events)

### 8.2 Refunds

- `POST /api/payments/:paymentId/refund` — Issue full/partial refund _(admin)_

### 8.3 Saved Payment Methods

- `GET /api/users/me/payment-methods` — List saved cards
- `POST /api/users/me/payment-methods` — Save new card
- `DELETE /api/users/me/payment-methods/:id` — Remove card
- `PATCH /api/users/me/payment-methods/:id/default` — Set default

---

## 9. Coupons & Discounts

- `POST /api/coupons/validate` — Validate coupon code, return discount info
- `GET /api/admin/coupons` — List coupons _(admin)_
- `POST /api/admin/coupons` — Create coupon _(admin)_
- `PATCH /api/admin/coupons/:id` — Update coupon _(admin)_
- `DELETE /api/admin/coupons/:id` — Delete coupon _(admin)_

**Coupon fields:** code, type (percent/fixed/free_shipping), value, minOrderAmount, maxUses, expiresAt, perUserLimit

---

## 10. Reviews & Ratings

- `GET /api/products/:id/reviews` — List reviews (paginated, filterable by rating)
- `POST /api/products/:id/reviews` — Submit review `{ rating, title, body, images[] }`
- `PATCH /api/reviews/:id` — Edit own review
- `DELETE /api/reviews/:id` — Delete own review
- `POST /api/reviews/:id/helpful` — Mark review as helpful
- `GET /api/admin/reviews` — All reviews with moderation status _(admin)_
- `PATCH /api/admin/reviews/:id/approve` — Approve/reject review _(admin)_

---

## 11. Blog

- `GET /api/blog/posts` — List posts (with `category`, `author`, `search`, pagination)
- `GET /api/blog/posts/:slug` — Single post
- `GET /api/blog/categories` — Blog categories
- `POST /api/admin/blog/posts` — Create post _(admin)_
- `PATCH /api/admin/blog/posts/:id` — Update post _(admin)_
- `DELETE /api/admin/blog/posts/:id` — Delete post _(admin)_

---

## 12. Search & Discovery

- `GET /api/search?q=...` — Full-text search across products, categories, brands, blogs
  - Supports filters (same as `/api/products`)
  - Returns grouped results by type
- `GET /api/search/suggestions?q=...` — Autocomplete suggestions
- `GET /api/search/trending` — Trending search terms
- `POST /api/search/track` — Track search query for analytics

---

## 13. Collections & Flash Sales

- `GET /api/collections` — List collections (seasonal, thematic)
- `GET /api/collections/:slug` — Collection detail + products
- `GET /api/flash-sales/active` — Active flash sale with countdown end time
- `GET /api/flash-sales/:id/products` — Flash sale products

---

## 14. Newsletter & Marketing

- `POST /api/newsletter/subscribe` — Subscribe email
- `POST /api/newsletter/unsubscribe` — Unsubscribe via token
- `POST /api/notifications/popup` — Log sales popup view/dismiss

---

## 15. Content & CMS

- `GET /api/hero-slides` — Hero banner slides
- `GET /api/testimonials` — Customer testimonials (paginated)
- `GET /api/brands/featured` — Featured brands for homepage
- `GET /api/collections/featured` — Featured collections
- `GET /api/instagram-posts` — Instagram feed posts
- `GET /api/features` — Feature highlights for feature sections

---

## 16. Admin Dashboard APIs

- `GET /api/admin/stats` — Dashboard stats (revenue, orders, users, products)
- `GET /api/admin/stats/sales` — Sales chart data (daily/weekly/monthly)
- `GET /api/admin/stats/top-products` — Best-selling products
- `GET /api/admin/stats/top-categories` — Top-performing categories
- `GET /api/admin/users` — List users (filterable, paginated) _(implemented)_
- `PATCH /api/admin/users/:id/status` — Enable/disable user _(implemented)_
- `GET /api/admin/inventory/low-stock` — Products below stock threshold

---

## 17. Cross-Cutting Concerns

| Concern               | Details                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| **Auth middleware**   | JWT Bearer on all `/api/users/me/*`, `/api/orders/*`, `/api/wishlist`, `/api/cart` (when logged in) |
| **Admin guard**       | Role check on all `/api/admin/*` routes                                                             |
| **Rate limiting**     | Auth endpoints (register, login, refresh) — implemented on server                                   |
| **Integration tests** | `server/test/` health + auth + commerce smoke tests (`npm run test`)                                |
| **Pagination**        | Consistent `{ data, meta: { page, limit, total, totalPages } }` envelope                            |
| **Error format**      | `{ error: { code, message, details? } }`                                                            |
| **File uploads**      | Product images, review images, user avatars → S3/Cloudflare R2                                      |
| **Webhooks**          | Payment provider (Stripe), inventory sync                                                           |
| **Caching**           | Products list, categories, brands, collections → Redis or Next.js `revalidate`                      |
| **Localization**      | `Accept-Language` header; currency via `?currency=USD`                                              |

---

## Priority Order for Development

1. **Auth + Users** — foundation for all user-scoped features
2. **Products + Categories + Brands** — catalog backbone
3. **Cart + Wishlist** — core shopping flow
4. **Orders + Checkout + Payments** — revenue path
5. **Reviews + Search** — discovery & trust
6. **Blog + Content APIs** — marketing content
7. **Admin APIs + Analytics** — operational management
8. **Collections + Flash Sales + Coupons** — promotional features
