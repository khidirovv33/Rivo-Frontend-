import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateCustomerRequest, CustomerDto, UpdateCustomerRequest } from '@/types/domain';

export async function listCustomers(params: PagedRequest): Promise<PaginatedList<CustomerDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<CustomerDto>>>('/customers', { params });
  return data.data!;
}

export async function getCustomer(id: string): Promise<CustomerDto> {
  const { data } = await apiClient.get<ApiResponse<CustomerDto>>(`/customers/${id}`);
  return data.data!;
}

export async function createCustomer(payload: CreateCustomerRequest): Promise<CustomerDto> {
  const { data } = await apiClient.post<ApiResponse<CustomerDto>>('/customers', payload);
  return data.data!;
}

export async function updateCustomer(id: string, payload: UpdateCustomerRequest): Promise<CustomerDto> {
  const { data } = await apiClient.put<ApiResponse<CustomerDto>>(`/customers/${id}`, payload);
  return data.data!;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
