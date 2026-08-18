import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateReturnRequest, ReturnDto } from '@/types/domain';

export async function listReturns(params: PagedRequest): Promise<PaginatedList<ReturnDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<ReturnDto>>>('/returns', { params });
  return data.data!;
}

export async function getReturn(id: string): Promise<ReturnDto> {
  const { data } = await apiClient.get<ApiResponse<ReturnDto>>(`/returns/${id}`);
  return data.data!;
}

export async function createReturn(payload: CreateReturnRequest): Promise<ReturnDto> {
  const { data } = await apiClient.post<ApiResponse<ReturnDto>>('/returns', payload);
  return data.data!;
}
