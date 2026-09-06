import type { Request } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { toCartDto } from "./commerce.serializers.js";
import { refreshCartLineItems } from "./commerce-hygiene.service.js";

export const GUEST_CART_HEADER = "x-guest-cart-id";

export function getGuestSessionId(req: Request): string | undefined {
  const header = req.header(GUEST_CART_HEADER);
  return header?.trim() || undefined;
}

export async function resolveCart(req: AuthenticatedRequest) {
  const userId = req.auth?.userId;
  const guestSessionId = getGuestSessionId(req);

  if (userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  }

  if (!guestSessionId) {
    throw new AppError(400, "Guest cart id header is required");
  }

  let cart = await Cart.findOne({ guestSessionId });
  if (!cart) {
    cart = await Cart.create({ guestSessionId, items: [] });
  }
  return cart;
}

export async function getOrCreateUserCart(userId: string) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

async function assertPublishedProductStock(
  productId: string,
  quantity: number,
  productName?: string
) {
  const product = await Product.findById(productId);
  if (!product || product.status !== "published") {
    throw new AppError(
      404,
      productName ? `${productName} is unavailable` : "Product not found"
    );
  }

  if (product.stock < quantity) {
    throw new AppError(
      400,
      productName
        ? `Insufficient stock for ${productName}`
        : "Insufficient stock"
    );
  }

  return product;
}

export async function addProductToCart(
  cart: Awaited<ReturnType<typeof resolveCart>>,
  productId: string,
  quantity: number
) {
  const product = await assertPublishedProductStock(productId, quantity);

  const existing = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existing) {
    const nextQty = existing.quantity + quantity;
    await assertPublishedProductStock(productId, nextQty, product.name);
    existing.quantity = nextQty;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] ?? "",
      price: product.price,
    });
  }

  await cart.save();
  return toCartDto(cart);
}

export async function updateCartItemQuantity(
  cart: Awaited<ReturnType<typeof resolveCart>>,
  itemId: string,
  quantity: number
) {
  const item = cart.items.find((entry) => entry._id.toString() === itemId);
  if (!item) {
    throw new AppError(404, "Cart item not found");
  }

  await assertPublishedProductStock(
    item.productId.toString(),
    quantity,
    item.productName
  );

  item.quantity = quantity;
  await cart.save();
  return toCartDto(cart);
}

export async function mergeGuestCartIntoUser(
  userId: string,
  guestSessionId: string
) {
  const guestCart = await Cart.findOne({ guestSessionId });
  const userCart = await getOrCreateUserCart(userId);

  if (!guestCart) {
    await refreshCartLineItems(userCart);
    return toCartDto(userCart);
  }

  if (guestCart.items.length > 0) {
    for (const guestItem of guestCart.items) {
      const productId = guestItem.productId.toString();
      const product = await Product.findById(productId);
      if (!product || product.status !== "published") {
        continue;
      }

      const existing = userCart.items.find(
        (item) => item.productId.toString() === productId
      );
      const nextQty = (existing?.quantity ?? 0) + guestItem.quantity;

      if (product.stock < nextQty) {
        continue;
      }

      if (existing) {
        existing.quantity = nextQty;
        existing.productName = product.name;
        existing.productSlug = product.slug;
        existing.productImage = product.images[0] ?? "";
        existing.price = product.price;
      } else {
        userCart.items.push({
          productId: product._id,
          quantity: guestItem.quantity,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images[0] ?? "",
          price: product.price,
        });
      }
    }

    await userCart.save();
  }

  const deletedGuestCart = await Cart.findOneAndDelete({
    _id: guestCart._id,
    guestSessionId,
  });
  if (!deletedGuestCart) {
    const latestUserCart = await getOrCreateUserCart(userId);
    await refreshCartLineItems(latestUserCart);
    return toCartDto(latestUserCart);
  }

  await refreshCartLineItems(userCart);
  return toCartDto(userCart);
}
