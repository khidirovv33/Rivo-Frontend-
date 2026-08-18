import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/endpoints/auth';
import * as usersApi from '@/api/endpoints/users';
import { setAuthFailureHandler } from '@/api/client';
import { clearTokens, getRefreshToken, hasStoredSession, setTokens } from './tokenStore';
import type { LoginRequest, RegisterRequest, UserDto } from '@/types/domain';

interface AuthContextValue {
  user: UserDto | null;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const me = await usersApi.getMe();
    setUser(me);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasStoredSession()) {
        setIsBootstrapping(false);
        return;
      }
      try {
        // accessToken после перезагрузки страницы пуст — первый запрос уйдёт без него,
        // получит 401, и response-интерцептор клиента сам выполнит silent refresh и повтор.
        await loadCurrentUser();
      } catch {
        clearTokens();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCurrentUser]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const result = await authApi.login(payload);
      setTokens(result);
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const result = await authApi.register(payload);
      setTokens(result);
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    setUser(null);
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isBootstrapping, login, register, logout, refreshCurrentUser: loadCurrentUser }),
    [user, isBootstrapping, login, register, logout, loadCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
