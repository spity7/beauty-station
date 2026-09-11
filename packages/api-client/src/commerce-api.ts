import { platformApi } from "./generated/index.js";

export async function fetchCart() {
  return platformApi.getCart();
}

export async function addCartItem(productId: string, quantity = 1) {
  return platformApi.addCartItem({ productId, quantity });
}

export async function updateCartItem(itemId: string, quantity: number) {
  return platformApi.updateCartItem(itemId, { quantity });
}

export async function removeCartItem(itemId: string) {
  return platformApi.removeCartItem(itemId);
}

export async function clearCart() {
  return platformApi.clearCart();
}

export async function mergeGuestCart(guestSessionId: string) {
  return platformApi.mergeCart({ guestSessionId });
}

export async function createOrderFromCart(shippingAddress?: {
  name: string;
  line1: string;
  city: string;
  country: string;
  phone?: string;
}) {
  return platformApi.createOrder(shippingAddress ? { shippingAddress } : {});
}

export async function fetchOrders() {
  return platformApi.listOrders();
}

export async function fetchOrder(id: string) {
  return platformApi.getOrder(id);
}

export async function cancelOrder(id: string) {
  return platformApi.cancelOrder(id);
}

export async function updateUserProfile(input: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  return platformApi.updateUserProfile(input);
}

export async function uploadUserAvatar(file: File | Blob) {
  return platformApi.uploadUserAvatar({ file });
}

export async function removeUserAvatar() {
  return platformApi.updateUserProfile({ avatarUrl: "" });
}

export async function getUserProfile() {
  return platformApi.getUserProfile();
}

export async function deleteAccount(input: {
  password?: string;
  idToken?: string;
}) {
  return platformApi.deleteAccount(input);
}

export async function requestEmailVerification() {
  return platformApi.requestEmailVerification();
}

export async function verifyEmail(token: string) {
  return platformApi.verifyEmail({ token });
}

export async function socialAuthWithGoogle(idToken: string) {
  return platformApi.socialAuth({ provider: "google", idToken });
}

export async function changePassword(input: {
  currentPassword?: string;
  newPassword: string;
  idToken?: string;
}) {
  return platformApi.changePassword(input);
}

export async function forgotPassword(email: string) {
  return platformApi.forgotPassword({ email });
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}) {
  return platformApi.resetPassword(input);
}

export async function fetchUserAddresses() {
  return platformApi.listUserAddresses();
}

export async function createUserAddress(input: {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}) {
  return platformApi.createUserAddress(input);
}

export async function updateUserAddress(
  addressId: string,
  input: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  }
) {
  return platformApi.updateUserAddress(addressId, input);
}

export async function deleteUserAddress(addressId: string) {
  return platformApi.deleteUserAddress(addressId);
}

export async function setDefaultUserAddress(addressId: string) {
  return platformApi.setDefaultUserAddress(addressId);
}

export async function fetchWishlist() {
  return platformApi.getWishlist();
}

export async function addWishlistItem(productId: string) {
  return platformApi.addWishlistItem({ productId });
}

export async function removeWishlistItem(productId: string) {
  return platformApi.removeWishlistItem(productId);
}

export async function clearWishlist() {
  return platformApi.clearWishlist();
}

export async function moveWishlistItemToCart(productId: string, quantity = 1) {
  return platformApi.moveWishlistItemToCart({ productId, quantity });
}
