import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateReceivingRequest, ReceivingDto } from '@/types/domain';

export async function listReceiving(
  params: PagedRequest & { purchaseOrderId?: string },
): Promise<PaginatedList<ReceivingDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<ReceivingDto>>>('/receiving', { params });
  return data.data!;
}

export async function getReceiving(id: string): Promise<ReceivingDto> {
  const { data } = await apiClient.get<ApiResponse<ReceivingDto>>(`/receiving/${id}`);
  return data.data!;
}

export async function createReceiving(payload: CreateReceivingRequest): Promise<ReceivingDto> {
  const { data } = await apiClient.post<ApiResponse<ReceivingDto>>('/receiving', payload);
  return data.data!;
}
