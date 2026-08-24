import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateInventoryRequest, InventoryDto, InventoryItemDto, ScanInventoryItemRequest } from '@/types/domain';

export interface InventoryQuery extends PagedRequest {
  warehouseId?: string;
}

export async function listInventories(params: InventoryQuery): Promise<PaginatedList<InventoryDto>> {
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

export async function completeInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>(`/inventories/${id}/complete`);
  return data.data!;
}

export async function approveInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>(`/inventories/${id}/approve`);
  return data.data!;
}

export async function cancelInventory(id: string): Promise<InventoryDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryDto>>(`/inventories/${id}/cancel`);
  return data.data!;
}

export async function listInventoryItems(inventoryId: string): Promise<InventoryItemDto[]> {
  const { data } = await apiClient.get<ApiResponse<InventoryItemDto[]>>(`/inventories/${inventoryId}/items`);
  return data.data ?? [];
}

// Абсолютное значение actualQuantity — повторный скан того же товара перезаписывает count, не суммирует.
export async function scanInventoryItem(inventoryId: string, payload: ScanInventoryItemRequest): Promise<InventoryItemDto> {
  const { data } = await apiClient.post<ApiResponse<InventoryItemDto>>(`/inventories/${inventoryId}/items/scan`, payload);
  return data.data!;
}

export async function removeInventoryItem(inventoryId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/inventories/${inventoryId}/items/${itemId}`);
}
