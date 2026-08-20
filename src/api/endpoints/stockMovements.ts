import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { StockMovementDto } from '@/types/domain';

export async function listStockMovements(
  params: PagedRequest & { warehouseId?: string; productId?: string },
): Promise<PaginatedList<StockMovementDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<StockMovementDto>>>('/stock-movements', { params });
  return data.data!;
}
