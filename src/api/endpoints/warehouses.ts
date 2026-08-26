import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseDto } from '@/types/domain';

export async function listWarehouses(params: PagedRequest & { branchId?: string }): Promise<PaginatedList<WarehouseDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<WarehouseDto>>>('/warehouses', { params });
  return data.data!;
}

export async function listAllWarehouses(branchId?: string): Promise<WarehouseDto[]> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<WarehouseDto>>>('/warehouses', {
    params: { pageNumber: 1, pageSize: 100, branchId },
  });
  return data.data?.items ?? [];
}

export async function getWarehouse(id: string): Promise<WarehouseDto> {
  const { data } = await apiClient.get<ApiResponse<WarehouseDto>>(`/warehouses/${id}`);
  return data.data!;
}

export async function createWarehouse(payload: CreateWarehouseRequest): Promise<WarehouseDto> {
  const { data } = await apiClient.post<ApiResponse<WarehouseDto>>('/warehouses', payload);
  return data.data!;
}

export async function updateWarehouse(id: string, payload: UpdateWarehouseRequest): Promise<WarehouseDto> {
  const { data } = await apiClient.put<ApiResponse<WarehouseDto>>(`/warehouses/${id}`, payload);
  return data.data!;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await apiClient.delete(`/warehouses/${id}`);
}
