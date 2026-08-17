import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  BranchDto,
  CreateBranchRequest,
  CreateStoreRequest,
  StoreDto,
  UpdateBranchRequest,
  UpdateStoreRequest,
} from '@/types/domain';

export async function listStores(): Promise<StoreDto[]> {
  const { data } = await apiClient.get<ApiResponse<StoreDto[]>>('/stores');
  return data.data!;
}

export async function getStore(id: string): Promise<StoreDto> {
  const { data } = await apiClient.get<ApiResponse<StoreDto>>(`/stores/${id}`);
  return data.data!;
}

export async function createStore(payload: CreateStoreRequest): Promise<StoreDto> {
  const { data } = await apiClient.post<ApiResponse<StoreDto>>('/stores', payload);
  return data.data!;
}

export async function updateStore(id: string, payload: UpdateStoreRequest): Promise<StoreDto> {
  const { data } = await apiClient.put<ApiResponse<StoreDto>>(`/stores/${id}`, payload);
  return data.data!;
}

export async function deleteStore(id: string): Promise<void> {
  await apiClient.delete(`/stores/${id}`);
}

export async function createBranch(storeId: string, payload: CreateBranchRequest): Promise<BranchDto> {
  const { data } = await apiClient.post<ApiResponse<BranchDto>>(`/stores/${storeId}/branches`, payload);
  return data.data!;
}

export async function updateBranch(
  storeId: string,
  branchId: string,
  payload: UpdateBranchRequest,
): Promise<BranchDto> {
  const { data } = await apiClient.put<ApiResponse<BranchDto>>(
    `/stores/${storeId}/branches/${branchId}`,
    payload,
  );
  return data.data!;
}

export async function deleteBranch(storeId: string, branchId: string): Promise<void> {
  await apiClient.delete(`/stores/${storeId}/branches/${branchId}`);
}
