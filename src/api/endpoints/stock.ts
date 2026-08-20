import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { StockDto } from '@/types/domain';

export async function listStock(
  params: PagedRequest & { warehouseId?: string; productId?: string },
): Promise<PaginatedList<StockDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<StockDto>>>('/stock', { params });
  return data.data!;
}
