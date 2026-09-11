import type { CreateOrderInput } from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { getOrCreateUserCart } from "./cart.service.js";

type PlaceOrderContext = {
  userId: string;
  role: string;
};

const CUSTOMER_CANCELLABLE_STATUSES = new Set(["pending", "processing"]);

async function decrementStockWithRollback(
  items: Array<{ productId: unknown; quantity: number; productName: string }>
): Promise<void> {
  const decremented: Array<{ productId: unknown; quantity: number }> = [];

  try {
    for (const item of items) {
      const result = await Product.updateOne(
        {
          _id: item.productId,
          status: "published",
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount === 0) {
        throw new AppError(400, `Insufficient stock for ${item.productName}`);
      }

      decremented.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }
  } catch (error) {
    for (const entry of decremented) {
      await Product.updateOne(
        { _id: entry.productId },
        { $inc: { stock: entry.quantity } }
      );
    }
    throw error;
  }
}

export async function restoreOrderStock(
  items: Array<{ productId: unknown; quantity: number }>
): Promise<void> {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.quantity } }
    );
  }
}

export async function placeOrderFromCart(
  context: PlaceOrderContext,
  payload: CreateOrderInput
) {
  const cart = await getOrCreateUserCart(context.userId);

  if (cart.items.length === 0) {
    throw new AppError(400, "Cart is empty");
  }

  const user = await User.findById(context.userId);
  if (!user || user.deletedAt) {
    throw new AppError(404, "User not found");
  }

  if (context.role !== "admin" && !user.emailVerified) {
    throw new AppError(403, "Verify your email before placing an order");
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== "published") {
      throw new AppError(400, `Product ${item.productName} is unavailable`);
    }
  }

  const items = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage,
    price: item.price,
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await decrementStockWithRollback(cart.items);

  let order;
  try {
    order = await Order.create({
      userId: context.userId,
      status: "pending",
      items,
      subtotal,
      total: subtotal,
      shippingAddress: payload.shippingAddress,
    });

    cart.set("items", []);
    await cart.save();
  } catch (error) {
    await restoreOrderStock(cart.items);

    if (order) {
      await Order.deleteOne({ _id: order._id });
    }

    throw error;
  }

  return { order, user };
}

export async function cancelOrderForCustomer(
  orderId: string,
  userId: string
) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.userId.toString() !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (!CUSTOMER_CANCELLABLE_STATUSES.has(order.status)) {
    throw new AppError(
      400,
      "This order can no longer be cancelled because it has already shipped."
    );
  }

  const previousStatus = order.status;
  order.status = "cancelled";
  await order.save();

  if (previousStatus !== "cancelled") {
    await restoreOrderStock(order.items);
  }

  return order;
}
