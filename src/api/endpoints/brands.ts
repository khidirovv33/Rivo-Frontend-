import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { BrandDto, CreateBrandRequest, UpdateBrandRequest } from '@/types/domain';

export async function listBrands(): Promise<BrandDto[]> {
  const { data } = await apiClient.get<ApiResponse<BrandDto[]>>('/brands');
  return data.data!;
}

export async function getBrand(id: string): Promise<BrandDto> {
  const { data } = await apiClient.get<ApiResponse<BrandDto>>(`/brands/${id}`);
  return data.data!;
}

export async function createBrand(payload: CreateBrandRequest): Promise<BrandDto> {
  const { data } = await apiClient.post<ApiResponse<BrandDto>>('/brands', payload);
  return data.data!;
}

export async function updateBrand(id: string, payload: UpdateBrandRequest): Promise<BrandDto> {
  const { data } = await apiClient.put<ApiResponse<BrandDto>>(`/brands/${id}`, payload);
  return data.data!;
}

export async function deleteBrand(id: string): Promise<void> {
  await apiClient.delete(`/brands/${id}`);
}
