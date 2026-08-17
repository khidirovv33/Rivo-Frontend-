import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { CreateRoleRequest, RoleDto, UpdateRoleRequest } from '@/types/domain';

export async function listRoles(): Promise<RoleDto[]> {
  const { data } = await apiClient.get<ApiResponse<RoleDto[]>>('/roles');
  return data.data!;
}

export async function getRole(id: string): Promise<RoleDto> {
  const { data } = await apiClient.get<ApiResponse<RoleDto>>(`/roles/${id}`);
  return data.data!;
}

// Без пермишен-гейта на бэкенде — любой авторизованный пользователь может узнать права своей
// же роли (Roles.Read защищает управление ролями, не самоинспекцию). Использовать в usePermissions().
export async function getMyRole(): Promise<RoleDto> {
  const { data } = await apiClient.get<ApiResponse<RoleDto>>('/roles/me');
  return data.data!;
}

export async function createRole(payload: CreateRoleRequest): Promise<RoleDto> {
  const { data } = await apiClient.post<ApiResponse<RoleDto>>('/roles', payload);
  return data.data!;
}

export async function updateRole(id: string, payload: UpdateRoleRequest): Promise<RoleDto> {
  const { data } = await apiClient.put<ApiResponse<RoleDto>>(`/roles/${id}`, payload);
  return data.data!;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}
