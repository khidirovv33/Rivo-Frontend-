import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateTransferRequest, TransferDto } from '@/types/domain';

export async function listTransfers(
  params: PagedRequest & { warehouseId?: string },
): Promise<PaginatedList<TransferDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<TransferDto>>>('/transfers', { params });
  return data.data!;
}

export async function getTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.get<ApiResponse<TransferDto>>(`/transfers/${id}`);
  return data.data!;
}

export async function createTransfer(payload: CreateTransferRequest): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>('/transfers', payload);
  return data.data!;
}

export async function submitTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>(`/transfers/${id}/submit`);
  return data.data!;
}

export async function approveTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>(`/transfers/${id}/approve`);
  return data.data!;
}

export async function shipTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>(`/transfers/${id}/ship`);
  return data.data!;
}

export async function receiveTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>(`/transfers/${id}/receive`);
  return data.data!;
}

export async function cancelTransfer(id: string): Promise<TransferDto> {
  const { data } = await apiClient.post<ApiResponse<TransferDto>>(`/transfers/${id}/cancel`);
  return data.data!;
}
