import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateInventoryRequest, InventoryDto, UpdateInventoryItemRequest } from '@/types/domain';

export async function listInventories(params: PagedRequest): Promise<PaginatedList<InventoryDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<InventoryDto>>>('/inventories', { params });
  return data.data!;
}

export async function getInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.get<ApiResponse<InventoryDto>>(`/inventories/${id}`);
  return data.data!;
}

export async function createInventory(payload: CreateInventoryRequest): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>('/inventories', payload);
  return data.data!;
}

export async function updateInventoryItem(
  inventoryId: string,
  itemId: string,
  payload: UpdateInventoryItemRequest,
): Promise<void> {
  await apiClient.put(`/inventories/${inventoryId}/items/${itemId}`, payload);
}

export async function confirmInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>(`/inventories/${id}/confirm`);
  return data.data!;
}

export async function cancelInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>(`/inventories/${id}/cancel`);
  return data.data!;
}
