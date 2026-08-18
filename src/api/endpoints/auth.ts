import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { AuthResult, LoginRequest, RegisterRequest } from '@/types/domain';

export async function register(payload: RegisterRequest): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', payload);
  return data.data!;
}

export async function login(payload: LoginRequest): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', payload);
  return data.data!;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/reset-password', payload);
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/change-password', payload);
}

export async function verifyEmail(payload: { email: string; token: string }): Promise<void> {
  await apiClient.post('/auth/verify-email', payload);
}
