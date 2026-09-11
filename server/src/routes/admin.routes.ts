import { Router } from "express";
import {
  adminUserListQuerySchema,
  updateAdminUserStatusSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import {
  requireAuth,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toIsoString } from "../utils/admin-user-serializers.js";

export const adminRouter = Router();

adminRouter.get(
  "/users",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const query = adminUserListQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    if (query.role) {
      filter.role = query.role;
    } else {
      filter.role = "customer";
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((user) => user._id);
    const orderCounts = await Order.aggregate<{ _id: unknown; count: number }>([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const orderCountByUserId = new Map(
      orderCounts.map((entry) => [String(entry._id), entry.count])
    );

    res.json({
      data: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || undefined,
        emailVerified: user.emailVerified ?? false,
        isActive: user.isActive !== false,
        orderCount: orderCountByUserId.get(user._id.toString()) ?? 0,
        createdAt: toIsoString(user.createdAt),
      })),
      total,
      page,
      limit,
    });
  })
);

adminRouter.patch(
  "/users/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payload = updateAdminUserStatusSchema.parse(req.body);
    const user = await User.findById(req.params.id);

    if (!user || user.deletedAt) {
      throw new AppError(404, "User not found");
    }

    if (user.role === "admin" && payload.isActive === false) {
      throw new AppError(400, "Admin accounts cannot be disabled from here");
    }

    user.isActive = payload.isActive;
    if (!payload.isActive) {
      user.refreshTokenVersion = (user.refreshTokenVersion ?? 0) + 1;
    }
    await user.save();

    const orderCount = await Order.countDocuments({ userId: user._id });

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || undefined,
      emailVerified: user.emailVerified ?? false,
      isActive: user.isActive !== false,
      orderCount,
      createdAt: toIsoString(user.createdAt),
    });
  })
);
