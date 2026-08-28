import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { StockDto } from '@/types/domain';

export interface StockQuery extends PagedRequest {
  warehouseId?: string;
  productId?: string;
}

export async function listStock(params: StockQuery): Promise<PaginatedList<StockDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<StockDto>>>('/stock', { params });
  return data.data!;
}

export async function getStock(warehouseId: string, productId: string, productVariationId?: string): Promise<StockDto> {
  const { data } = await apiClient.get<ApiResponse<StockDto>>(`/stock/${warehouseId}/${productId}`, {
    params: { productVariationId },
  });
  return data.data!;
}
