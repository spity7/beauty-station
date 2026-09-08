import { platformApi } from "./generated/index.js";
import { ApiError } from "./mutator.js";
import type {
  ListAttributeParams,
  ListBrandParams,
  ListCategoryParams,
  ListProductParams,
} from "./generated/platform.schemas.js";

export {
  createAttributeApi,
  createBrandApi,
  createCategoryApi,
  createProductApi,
  deleteAttributeApi,
  deleteBrandApi,
  deleteCategoryApi,
  deleteProductApi,
  getAttributeApi,
  getBrandApi,
  getCategoryApi,
  getProductApi,
  updateAttributeApi,
  updateBrandApi,
  updateCategoryApi,
  updateProductApi,
} from "./catalog-api.js";

export async function fetchProducts(params?: ListProductParams) {
  return platformApi.listProduct(params);
}

export async function fetchCategories(params?: ListCategoryParams) {
  return platformApi.listCategory(params);
}

export async function fetchBrands(params?: ListBrandParams) {
  return platformApi.listBrand(params);
}

export async function fetchAttributes(params?: ListAttributeParams) {
  return platformApi.listAttribute(params);
}

export async function removeProduct(id: string) {
  await platformApi.deleteProduct(id);
}

export async function fetchPublishedProducts(limit = 8) {
  return platformApi.listProduct({
    status: "published",
    limit,
  });
}

export async function fetchPublishedCategories(limit = 100) {
  return platformApi.listCategory({
    status: "published",
    limit,
  });
}

export async function fetchStorefrontBrands(limit = 100) {
  const response = await platformApi.listBrand({
    status: "published",
    limit,
  });

  return {
    ...response,
    data: response.data.filter((brand) => brand.visibility !== "Hidden"),
  };
}

export async function fetchProductBySlug(slug: string) {
  try {
    return await platformApi.getProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchProductById(id: string) {
  return platformApi.getProduct(id);
}
