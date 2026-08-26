import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseDto } from '@/types/domain';

// GET /api/warehouses не принимает storeId/branchId как query-параметр (сверено по Swagger) —
// список тянем целиком (до 100) и фильтруем на фронте.
export async function listWarehouses(params: PagedRequest): Promise<PaginatedList<WarehouseDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<WarehouseDto>>>('/warehouses', { params });
  return data.data!;
}

export async function listAllWarehouses(storeId?: string): Promise<WarehouseDto[]> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<WarehouseDto>>>('/warehouses', {
    params: { pageNumber: 1, pageSize: 100 },
  });
  const items = data.data?.items ?? [];
  return storeId ? items.filter((w) => w.storeId === storeId) : items;
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
