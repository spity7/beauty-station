import { Router } from "express";
import {
  createOrderSchema,
  listQuerySchema,
  updateOrderStatusSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import {
  requireAuth,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toOrderDto } from "../services/commerce.serializers.js";
import {
  getOrderCustomer,
  getOrderUserId,
} from "../services/order-customer.js";
import {
  cancelOrderForCustomer,
  placeOrderFromCart,
  restoreOrderStock,
} from "../services/order.service.js";

export const ordersRouter = Router();

ordersRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payload = createOrderSchema.parse(req.body);
    const { order, user } = await placeOrderFromCart(
      {
        userId: req.auth!.userId,
        role: req.auth!.role,
      },
      payload
    );

    res
      .status(201)
      .json(toOrderDto(order, { name: user.name, email: user.email }));
  })
);

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const query = listQuerySchema.parse(req.query);
    const isAdmin = req.auth?.role === "admin";
    const filter =
      isAdmin && req.query.mine !== "true" ? {} : { userId: req.auth!.userId };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      data: orders.map((order) => toOrderDto(order, getOrderCustomer(order))),
      total,
      page,
      limit,
    });
  })
);

ordersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!order) {
      throw new AppError(404, "Order not found");
    }

    const isOwner = getOrderUserId(order) === req.auth!.userId;
    if (!isOwner && req.auth!.role !== "admin") {
      throw new AppError(403, "Forbidden");
    }

    res.json(toOrderDto(order, getOrderCustomer(order)));
  })
);

ordersRouter.post(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const orderId = req.params.id;
    if (!orderId || Array.isArray(orderId)) {
      throw new AppError(400, "Invalid order ID");
    }

    const order = await cancelOrderForCustomer(orderId, req.auth!.userId);
    await order.populate("userId", "name email");
    res.json(toOrderDto(order, getOrderCustomer(order)));
  })
);

ordersRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payload = updateOrderStatusSchema.parse(req.body);
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError(404, "Order not found");
    }

    const previousStatus = order.status;
    order.status = payload.status;

    if (
      payload.status === "cancelled" &&
      previousStatus !== "cancelled" &&
      previousStatus !== "delivered"
    ) {
      await restoreOrderStock(order.items);
    }

    await order.save();
    await order.populate("userId", "name email");
    res.json(toOrderDto(order, getOrderCustomer(order)));
  })
);
