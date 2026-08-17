import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type {
  CreateProductRequest,
  CreateProductVariationRequest,
  ProductDto,
  ProductVariationDto,
  UpdateProductRequest,
  UpdateProductVariationRequest,
} from '@/types/domain';

export async function listProducts(params: PagedRequest): Promise<PaginatedList<ProductDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<ProductDto>>>('/products', { params });
  return data.data!;
}

export async function getProduct(id: string): Promise<ProductDto> {
  const { data } = await apiClient.get<ApiResponse<ProductDto>>(`/products/${id}`);
  return data.data!;
}

export async function getProductByBarcode(barcode: string): Promise<ProductDto> {
  const { data } = await apiClient.get<ApiResponse<ProductDto>>(`/products/barcode/${encodeURIComponent(barcode)}`);
  return data.data!;
}

export async function createProduct(payload: CreateProductRequest): Promise<ProductDto> {
  const { data } = await apiClient.post<ApiResponse<ProductDto>>('/products', payload);
  return data.data!;
}

export async function updateProduct(id: string, payload: UpdateProductRequest): Promise<ProductDto> {
  const { data } = await apiClient.put<ApiResponse<ProductDto>>(`/products/${id}`, payload);
  return data.data!;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function createVariation(
  productId: string,
  payload: CreateProductVariationRequest,
): Promise<ProductVariationDto> {
  const { data } = await apiClient.post<ApiResponse<ProductVariationDto>>(
    `/products/${productId}/variations`,
    payload,
  );
  return data.data!;
}

export async function updateVariation(
  productId: string,
  variationId: string,
  payload: UpdateProductVariationRequest,
): Promise<ProductVariationDto> {
  const { data } = await apiClient.put<ApiResponse<ProductVariationDto>>(
    `/products/${productId}/variations/${variationId}`,
    payload,
  );
  return data.data!;
}

export async function deleteVariation(productId: string, variationId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}/variations/${variationId}`);
}
