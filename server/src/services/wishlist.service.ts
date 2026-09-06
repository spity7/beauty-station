import { AppError } from "../middleware/errorHandler.js";
import { Product } from "../models/Product.js";
import { Wishlist } from "../models/Wishlist.js";
import { addProductToCart, getOrCreateUserCart } from "./cart.service.js";
import { refreshWishlistLineItems } from "./commerce-hygiene.service.js";
import {
  mapWishlistItemSnapshot,
  toWishlistDto,
} from "./wishlist.serializers.js";

export async function getOrCreateUserWishlist(userId: string) {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, items: [] });
  }
  return wishlist;
}

async function assertPublishedProduct(productId: string) {
  const product = await Product.findById(productId);
  if (!product || product.status !== "published") {
    throw new AppError(404, "Product not found");
  }
  return product;
}

export async function addProductToWishlist(userId: string, productId: string) {
  const product = await assertPublishedProduct(productId);
  const wishlist = await getOrCreateUserWishlist(userId);

  const existing = wishlist.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existing) {
    existing.productName = product.name;
    existing.productSlug = product.slug;
    existing.productImage = product.images[0] ?? "";
    existing.price = product.price;
  } else {
    wishlist.items.push(mapWishlistItemSnapshot(product));
  }

  await wishlist.save();
  return toWishlistDto(wishlist);
}

export async function removeProductFromWishlist(
  userId: string,
  productId: string
) {
  const wishlist = await getOrCreateUserWishlist(userId);
  const index = wishlist.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (index === -1) {
    throw new AppError(404, "Wishlist item not found");
  }

  wishlist.items.splice(index, 1);
  await wishlist.save();
  return toWishlistDto(wishlist);
}

export async function clearUserWishlist(userId: string) {
  const wishlist = await getOrCreateUserWishlist(userId);
  wishlist.set("items", []);
  await wishlist.save();
  return toWishlistDto(wishlist);
}

export async function moveWishlistItemToCart(
  userId: string,
  productId: string,
  quantity = 1
) {
  const wishlist = await getOrCreateUserWishlist(userId);
  const index = wishlist.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (index === -1) {
    throw new AppError(404, "Wishlist item not found");
  }

  const cart = await getOrCreateUserCart(userId);
  const cartDto = await addProductToCart(cart, productId, quantity);

  wishlist.items.splice(index, 1);
  await wishlist.save();

  return {
    wishlist: await toWishlistDto(wishlist),
    cart: cartDto,
  };
}

export async function getUserWishlist(userId: string) {
  const wishlist = await getOrCreateUserWishlist(userId);
  await refreshWishlistLineItems(wishlist);
  return toWishlistDto(wishlist);
}
