import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { CreateReceivingRequest, ReceivingDto } from '@/types/domain';

export async function listReceivingsForOrder(purchaseOrderId: string): Promise<ReceivingDto[]> {
  const { data } = await apiClient.get<ApiResponse<ReceivingDto[]>>('/receiving', { params: { purchaseOrderId } });
  return data.data ?? [];
}

export async function createReceiving(payload: CreateReceivingRequest): Promise<ReceivingDto> {
  const { data } = await apiClient.post<ApiResponse<ReceivingDto>>('/receiving', payload);
  return data.data!;
}
