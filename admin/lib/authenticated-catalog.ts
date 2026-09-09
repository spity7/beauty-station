import { cookies } from "next/headers";
import axios from "axios";
import { getApiBaseUrl } from "@platform/api-client";
import type {
  PaginatedResponse,
  ProductDto,
  ProductListQuery,
} from "@platform/shared";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

async function getAdminAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

function authHeaders(token: string | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminProducts(
  params: Partial<ProductListQuery> = {}
): Promise<PaginatedResponse<ProductDto>> {
  const token = await getAdminAccessToken();
  const response = await axios.get<PaginatedResponse<ProductDto>>(
    `${getApiBaseUrl()}/api/products`,
    {
      params: { page: 1, limit: 20, ...params },
      headers: authHeaders(token),
    }
  );
  return response.data;
}

export async function fetchAdminProductById(id: string): Promise<ProductDto> {
  const token = await getAdminAccessToken();
  const response = await axios.get<ProductDto>(
    `${getApiBaseUrl()}/api/products/${id}`,
    {
      headers: authHeaders(token),
    }
  );
  return response.data;
}
