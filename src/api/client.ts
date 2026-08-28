import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import i18n from '@/i18n';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/auth/tokenStore';
import type { ApiResponse } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const apiClient = axios.create({ baseURL });

/**
 * Часть ответов бэкенда (401/403/404/500, пойманные ExceptionHandlingMiddleware) сериализуются
 * вручную с дефолтными опциями System.Text.Json → PascalCase-ключи конверта (`Success`,
 * `Message`, `Errors`). Обычные 200/400-ответы идут через MVC-конвейер → camelCase. Нормализуем
 * верхнеуровневые ключи конверта здесь один раз, а не в каждом месте, где он читается.
 */
function normalizeEnvelope<T>(raw: Record<string, unknown>): ApiResponse<T> {
  const pick = (camel: string, pascal: string) =>
    raw[camel] !== undefined ? raw[camel] : raw[pascal];
  return {
    success: Boolean(pick('success', 'Success')),
    data: (pick('data', 'Data') ?? null) as T | null,
    message: (pick('message', 'Message') ?? null) as string | null,
    errors: (pick('errors', 'Errors') ?? null) as Record<string, string[]> | null,
  };
}

function isEnvelopeShaped(value: unknown, responseType: string | undefined): value is Record<string, unknown> {
  if (responseType === 'blob' || responseType === 'arraybuffer' || responseType === 'text') {
    return false;
  }
  return typeof value === 'object' && value !== null && !(value instanceof Blob);
}

let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  // Обходим apiClient напрямую, чтобы не зациклиться на собственном интерцепторе.
  const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
  const envelope = normalizeEnvelope<{ accessToken: string; refreshToken: string }>(
    response.data as Record<string, unknown>,
  );
  if (!envelope.success || !envelope.data) {
    throw new Error(envelope.message ?? 'Refresh failed');
  }
  setTokens(envelope.data);
  return envelope.data.accessToken;
}

let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(handler: () => void): void {
  onAuthFailure = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  // Бэкенд локализует сообщения (ошибки, ответы AI-ассистента) по этому заголовку — держим его
  // синхронным с переключателем языка в интерфейсе, а не с языком браузера.
  config.headers.set('Accept-Language', i18n.language ?? 'ru');
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => {
    if (isEnvelopeShaped(response.data, response.config.responseType)) {
      response.data = normalizeEnvelope(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (isEnvelopeShaped(error.response?.data, error.config?.responseType)) {
      error.response!.data = normalizeEnvelope(error.response!.data as Record<string, unknown>);
    }

    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh-token');

    if (status === 401 && original && !original._retry && !isRefreshCall && getRefreshToken()) {
      original._retry = true;
      try {
        refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
        const newToken = await refreshInFlight;
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      } catch {
        clearTokens();
        onAuthFailure?.();
        return Promise.reject(error);
      }
    }

    if (status === 401 && (isRefreshCall || !getRefreshToken())) {
      clearTokens();
      onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.errors) {
      const firstField = Object.values(data.errors)[0];
      if (firstField?.[0]) return firstField[0];
    }
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return 'Произошла ошибка. Попробуйте ещё раз.';
}
