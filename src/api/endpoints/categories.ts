import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/domain';

export async function listCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<ApiResponse<CategoryDto[]>>('/categories');
  return data.data!;
}

export async function getCategory(id: string): Promise<CategoryDto> {
  const { data } = await apiClient.get<ApiResponse<CategoryDto>>(`/categories/${id}`);
  return data.data!;
}

export async function createCategory(payload: CreateCategoryRequest): Promise<CategoryDto> {
  const { data } = await apiClient.post<ApiResponse<CategoryDto>>('/categories', payload);
  return data.data!;
}

export async function updateCategory(id: string, payload: UpdateCategoryRequest): Promise<CategoryDto> {
  const { data } = await apiClient.put<ApiResponse<CategoryDto>>(`/categories/${id}`, payload);
  return data.data!;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
