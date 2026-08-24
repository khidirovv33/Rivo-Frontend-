import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateReceivingRequest, ReceivingDto } from '@/types/domain';

export interface ReceivingQuery extends PagedRequest {
  purchaseOrderId?: string;
}

export async function listReceivings(params: ReceivingQuery): Promise<PaginatedList<ReceivingDto>> {
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
