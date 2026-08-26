import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type { GenerateBarcodeRequest, GenerateBarcodeResult } from '@/types/domain';

export async function generateBarcode(payload: GenerateBarcodeRequest): Promise<GenerateBarcodeResult> {
  const { data } = await apiClient.post<ApiResponse<GenerateBarcodeResult>>('/barcodes/generate', payload);
  return data.data!;
}

export function barcodeImageUrl(code: string): string {
  const baseURL = import.meta.env.VITE_API_BASE_URL as string;
  return `${baseURL}/barcodes/${encodeURIComponent(code)}/image`;
}
