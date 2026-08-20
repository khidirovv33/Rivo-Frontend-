import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { DashboardDto } from '@/types/domain';

export async function getOverview(branchId?: string): Promise<DashboardDto> {
  const { data } = await apiClient.get<ApiResponse<DashboardDto>>('/dashboard', {
    params: branchId ? { branchId } : undefined,
  });
  return data.data!;
}
