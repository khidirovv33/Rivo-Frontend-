import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { CheckoutRequest, OrderDto } from '@/types/domain';

export async function checkout(payload: CheckoutRequest): Promise<OrderDto> {
  const { data } = await apiClient.post<ApiResponse<OrderDto>>('/pos/checkout', payload);
  return data.data!;
}

export async function getReceiptPdf(orderId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/pos/receipts/${orderId}`, { responseType: 'blob' });
  return data;
}

export async function emailReceipt(orderId: string, email: string): Promise<void> {
  await apiClient.post(`/pos/receipts/${orderId}/email`, { email });
}
