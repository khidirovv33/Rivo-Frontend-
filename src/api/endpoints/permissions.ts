import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { PermissionDto } from '@/types/domain';

export async function listPermissions(): Promise<PermissionDto[]> {
  const { data } = await apiClient.get<ApiResponse<PermissionDto[]>>('/permissions');
  return data.data!;
}
