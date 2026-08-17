import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { CreateUserRequest, UpdateOwnProfileRequest, UpdateUserRequest, UserDto } from '@/types/domain';

export async function getMe(): Promise<UserDto> {
  const { data } = await apiClient.get<ApiResponse<UserDto>>('/users/me');
  return data.data!;
}

export async function updateMe(payload: UpdateOwnProfileRequest): Promise<UserDto> {
  const { data } = await apiClient.patch<ApiResponse<UserDto>>('/users/me', payload);
  return data.data!;
}

export async function listUsers(params: PagedRequest): Promise<PaginatedList<UserDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<UserDto>>>('/users', { params });
  return data.data!;
}

export async function getUser(id: string): Promise<UserDto> {
  const { data } = await apiClient.get<ApiResponse<UserDto>>(`/users/${id}`);
  return data.data!;
}

export async function createUser(payload: CreateUserRequest): Promise<UserDto> {
  const { data } = await apiClient.post<ApiResponse<UserDto>>('/users', payload);
  return data.data!;
}

export async function updateUser(id: string, payload: UpdateUserRequest): Promise<UserDto> {
  const { data } = await apiClient.put<ApiResponse<UserDto>>(`/users/${id}`, payload);
  return data.data!;
}

export async function blockUser(id: string): Promise<void> {
  await apiClient.post(`/users/${id}/block`);
}

export async function unblockUser(id: string): Promise<void> {
  await apiClient.post(`/users/${id}/unblock`);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
