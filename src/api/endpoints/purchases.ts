import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { PurchaseDto, RecordPaymentRequest } from '@/types/domain';

export async function listPurchases(
  params: PagedRequest & { supplierId?: string },
): Promise<PaginatedList<PurchaseDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<PurchaseDto>>>('/purchases', { params });
  return data.data!;
}

export async function getPurchase(id: string): Promise<PurchaseDto> {
  const { data } = await apiClient.get<ApiResponse<PurchaseDto>>(`/purchases/${id}`);
  return data.data!;
}

export async function recordPurchasePayment(id: string, payload: RecordPaymentRequest): Promise<PurchaseDto> {
  const { data } = await apiClient.post<ApiResponse<PurchaseDto>>(`/purchases/${id}/payments`, payload);
  return data.data!;
}
