import { platformApi } from "./generated/index.js";
import type { ListAdminUsersParams } from "./generated/platform.schemas.js";

export async function fetchAdminUsers(params?: ListAdminUsersParams) {
  return platformApi.listAdminUsers(params);
}

export async function updateAdminUserStatus(id: string, isActive: boolean) {
  return platformApi.updateAdminUserStatus(id, { isActive });
}
