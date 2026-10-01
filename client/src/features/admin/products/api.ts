import { apiGet, apiPost, apiPut } from "@/lib/api";
import type {
  Category,
  CreateCategoryBody,
  CreateProductBody,
  Product,
  UpdateCategoryBody,
  UpdateProductBody,
} from "./types";

// category

export async function getAdminCategories() {
  return apiGet<Category[]>("/admin/categories");
}

export async function createAdminCategory(body: CreateCategoryBody) {
  return apiPost<Category, CreateCategoryBody>("/admin/categories", body);
}

export async function updateAdminCategory(
  categoryId: string,
  body: UpdateCategoryBody,
) {
  return apiPut<Category, UpdateCategoryBody>(
    `/admin/categories/${categoryId}`,
    body,
  );
}

// product
export async function getAdminProducts(search?: string) {
  const query = search?.trim()
    ? `/admin/products?search=${encodeURIComponent(search.trim())}`
    : `/admin/products`;

  return apiGet<Product[]>(query);
}

export async function getAdminProductById(productId: string) {
  return apiGet<Product>(`/admin/products/${productId}`);
}

function buildFormProductData(
  body: CreateProductBody | UpdateProductBody,
  files: File[],
) {
  const formData = new FormData();
  formData.append("title", body.title);
  formData.append("description", body.description);
  formData.append("category", body.category);
  formData.append("brand", body.brand);
  formData.append("price", String(body.price));
  formData.append("salePercentage", String(body.salePercentage));
  formData.append("stock", String(body.stock));
  formData.append("status", body.status);
  body.colors.forEach((color) => formData.append("colors", color));
  body.sizes.forEach((size) => formData.append("sizes", size));

  if ("existingImages" in body && body.existingImages) {
    formData.append("existingImages", JSON.stringify(body.existingImages));
  }

  if ("coverImagePublicId" in body && body.coverImagePublicId) {
    formData.append("coverImagePublicId", body.coverImagePublicId);
  }

  files.forEach((image) => formData.append("images", image));

  return formData;
}

export async function createAdminProduct(
  body: CreateProductBody,
  files: File[],
) {
  const formData = buildFormProductData(body, files);

  return apiPost<Product, FormData>("/admin/products", formData);
}

export async function updateAdminProduct(
  productId: string,
  body: UpdateProductBody,
  files: File[],
) {
  const formData = buildFormProductData(body, files);

  return apiPut<Product, FormData>(`/admin/products/${productId}`, formData);
}
