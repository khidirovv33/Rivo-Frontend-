import { apiClient } from '../client';
import type { ApiResponse, PagedRequest, PaginatedList } from '../types';
import type { BarcodeDto, GenerateBarcodeRequest, RegisterBarcodeRequest } from '@/types/domain';

export async function listProductBarcodes(productId: string, params: PagedRequest = {}): Promise<PaginatedList<BarcodeDto>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedList<BarcodeDto>>>(`/barcodes/product/${productId}`, {
    params,
  });
  return data.data!;
}

export async function scanBarcode(code: string): Promise<BarcodeDto> {
  const { data } = await apiClient.get<ApiResponse<BarcodeDto>>(`/barcodes/scan/${encodeURIComponent(code)}`);
  return data.data!;
}

export async function generateBarcode(payload: GenerateBarcodeRequest): Promise<BarcodeDto> {
  const { data } = await apiClient.post<ApiResponse<BarcodeDto>>('/barcodes/generate', payload);
  return data.data!;
}

export async function registerBarcode(payload: RegisterBarcodeRequest): Promise<BarcodeDto> {
  const { data } = await apiClient.post<ApiResponse<BarcodeDto>>('/barcodes/register', payload);
  return data.data!;
}

export async function deleteBarcode(id: string): Promise<void> {
  await apiClient.delete(`/barcodes/${id}`);
}

// GET .../label требует авторизации, поэтому обычный <img src="..."> не подходит (браузер не
// приложит JWT к запросу картинки) — грузим как blob через apiClient и отдаём object URL.
// Вызывающий код обязан освободить его через URL.revokeObjectURL при размонтировании/смене.
export async function fetchBarcodeLabelUrl(id: string): Promise<string> {
  const { data } = await apiClient.get<Blob>(`/barcodes/${id}/label`, { responseType: 'blob' });
  return URL.createObjectURL(data);
}
