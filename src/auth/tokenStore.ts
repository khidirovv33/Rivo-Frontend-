// Хранилище токенов вне React-дерева — нужно axios-интерцептору (client.ts), который не
// может читать React Context.
//
// accessToken — только в памяти (модульная переменная), никогда не в localStorage: XSS-риск.
// refreshToken — в localStorage. TODO: перевести на httpOnly-cookie, когда бэкенд начнёт его
// выставлять через Set-Cookie — сейчас AuthResultDto отдаёт его обычным JSON-полем, так что
// httpOnly-cookie на фронте настроить нечем.

const REFRESH_TOKEN_STORAGE_KEY = 'rivo.refreshToken';

let accessToken: string | null = null;
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function hasStoredSession(): boolean {
  return refreshToken !== null;
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
