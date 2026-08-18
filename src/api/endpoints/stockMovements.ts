import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { StockMovementDto, StockMovementType } from '@/types/domain';

export interface StockMovementQuery extends PagedRequest {
  warehouseId?: string;
  type?: StockMovementType;
}

export async function listStockMovements(params: StockMovementQuery): Promise<PaginatedList<StockMovementDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<StockMovementDto>>>('/stock-movements', { params });
  return data.data!;
}
