import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateStockMovementRequest, StockMovementDto } from '@/types/domain';

// GET /api/stock-movements не принимает фильтр по type (сверено по Swagger) — фильтруем на фронте.
export interface StockMovementQuery extends PagedRequest {
  warehouseId?: string;
  productId?: string;
}

export async function listStockMovements(params: StockMovementQuery): Promise<PaginatedList<StockMovementDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<StockMovementDto>>>('/stock-movements', { params });
  return data.data!;
}

export async function createStockMovement(payload: CreateStockMovementRequest): Promise<StockMovementDto> {
  const { data } = await apiClient.post<ApiResponse<StockMovementDto>>('/stock-movements', payload);
  return data.data!;
}
