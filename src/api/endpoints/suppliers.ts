import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateSupplierRequest, SupplierDto, UpdateSupplierRequest } from '@/types/domain';

export async function listSuppliers(params: PagedRequest): Promise<PaginatedList<SupplierDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<SupplierDto>>>('/suppliers', { params });
  return data.data!;
}

export async function listAllSuppliers(): Promise<SupplierDto[]> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<SupplierDto>>>('/suppliers', {
    params: { pageNumber: 1, pageSize: 100 },
  });
  return data.data?.items ?? [];
}

export async function getSupplier(id: string): Promise<SupplierDto> {
  const { data } = await apiClient.get<ApiResponse<SupplierDto>>(`/suppliers/${id}`);
  return data.data!;
}

export async function createSupplier(payload: CreateSupplierRequest): Promise<SupplierDto> {
  const { data } = await apiClient.post<ApiResponse<SupplierDto>>('/suppliers', payload);
  return data.data!;
}

export async function updateSupplier(id: string, payload: UpdateSupplierRequest): Promise<SupplierDto> {
  const { data } = await apiClient.put<ApiResponse<SupplierDto>>(`/suppliers/${id}`, payload);
  return data.data!;
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}
