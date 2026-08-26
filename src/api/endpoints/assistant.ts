import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { AskAssistantRequest, AssistantReply } from '@/types/domain';

export async function askAssistant(request: AskAssistantRequest): Promise<AssistantReply> {
  const { data } = await apiClient.post<ApiResponse<AssistantReply>>('/assistant/chat', request);
  return data.data!;
}
