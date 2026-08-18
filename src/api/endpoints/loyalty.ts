import axios from 'axios';
import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  CreateLoyaltyLevelRequest,
  IssueLoyaltyCardRequest,
  LoyaltyCardDto,
  LoyaltyLevelDto,
  UpdateLoyaltyLevelRequest,
} from '@/types/domain';

export async function listLoyaltyLevels(): Promise<LoyaltyLevelDto[]> {
  const { data } = await apiClient.get<ApiResponse<LoyaltyLevelDto[]>>('/loyalty/levels');
  return data.data!;
}

export async function createLoyaltyLevel(payload: CreateLoyaltyLevelRequest): Promise<LoyaltyLevelDto> {
  const { data } = await apiClient.post<ApiResponse<LoyaltyLevelDto>>('/loyalty/levels', payload);
  return data.data!;
}

export async function updateLoyaltyLevel(id: string, payload: UpdateLoyaltyLevelRequest): Promise<LoyaltyLevelDto> {
  const { data } = await apiClient.put<ApiResponse<LoyaltyLevelDto>>(`/loyalty/levels/${id}`, payload);
  return data.data!;
}

export async function deleteLoyaltyLevel(id: string): Promise<void> {
  await apiClient.delete(`/loyalty/levels/${id}`);
}

export async function issueLoyaltyCard(payload: IssueLoyaltyCardRequest): Promise<LoyaltyCardDto> {
  const { data } = await apiClient.post<ApiResponse<LoyaltyCardDto>>('/loyalty/cards', payload);
  return data.data!;
}

export async function getLoyaltyCardByCustomer(customerId: string): Promise<LoyaltyCardDto | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<LoyaltyCardDto>>(`/loyalty/cards/by-customer/${customerId}`);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
