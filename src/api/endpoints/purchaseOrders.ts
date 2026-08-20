import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreatePurchaseOrderRequest, PurchaseOrderDto } from '@/types/domain';

export async function listPurchaseOrders(
  params: PagedRequest & { supplierId?: string },
): Promise<PaginatedList<PurchaseOrderDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<PurchaseOrderDto>>>('/purchase-orders', { params });
  return data.data!;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrderDto> {
  const { data } = await apiClient.get<ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}`);
  return data.data!;
}

export async function createPurchaseOrder(payload: CreatePurchaseOrderRequest): Promise<PurchaseOrderDto> {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDto>>('/purchase-orders', payload);
  return data.data!;
}

export async function sendPurchaseOrder(id: string): Promise<PurchaseOrderDto> {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}/send`);
  return data.data!;
}

export async function confirmPurchaseOrder(id: string): Promise<PurchaseOrderDto> {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}/confirm`);
  return data.data!;
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrderDto> {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}/cancel`);
  return data.data!;
}
