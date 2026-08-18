import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { PaymentDto } from '@/types/domain';

export async function getPaymentsByOrder(orderId: string): Promise<PaymentDto[]> {
  const { data } = await apiClient.get<ApiResponse<PaymentDto[]>>(`/payments/by-order/${orderId}`);
  return data.data!;
}
