import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { OrderDto } from '@/types/domain';

export async function listOrders(params: PagedRequest): Promise<PaginatedList<OrderDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<OrderDto>>>('/orders', { params });
  return data.data!;
}

export async function getOrder(id: string): Promise<OrderDto> {
  const { data } = await apiClient.get<ApiResponse<OrderDto>>(`/orders/${id}`);
  return data.data!;
}
