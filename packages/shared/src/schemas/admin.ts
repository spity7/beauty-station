import { z } from "../zod.js";
import { USER_ROLES } from "../types/auth.js";
import { listQuerySchema } from "./catalog.js";

export const adminUserListQuerySchema = listQuerySchema.extend({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const adminUserListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  phone: z.string().optional(),
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  orderCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
});

export const paginatedAdminUsersSchema = z.object({
  data: z.array(adminUserListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const updateAdminUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type UpdateAdminUserStatusInput = z.infer<
  typeof updateAdminUserStatusSchema
>;
