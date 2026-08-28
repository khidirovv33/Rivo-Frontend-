import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getMyRole, getRole } from '@/api/endpoints/roles';
import { useAuth } from './useAuth';

/**
 * Права роли запрашиваются один раз за сессию (staleTime: Infinity) через GET /api/roles/me
 * и кэшируются в React Query, а не в самом контексте — см. FRONTEND_TZ.md §5.4. Эндпоинт без
 * пермишен-гейта (в отличие от GET /api/roles/{id}, который требует Roles.Read и был бы
 * недоступен Cashier/Manager/Warehouse Worker/Accountant для чтения своих же прав).
 *
 * ВРЕМЕННЫЙ FALLBACK: на бэкенде, поднятом локально на момент правки, GET /api/roles/me
 * отдаёт 404 (эндпоинта ещё нет — есть только /api/Roles и /api/Roles/{id}, оба под
 * Roles.Read). Пока бэкенд не добавит /api/roles/me, при 404 откатываемся на
 * GET /api/roles/{user.roleId} — это работает только для ролей, у которых уже есть
 * Roles.Read (Owner/Admin), и НЕ решает исходный баг для Cashier/Manager/Warehouse
 * Worker/Accountant (см. README). Убрать этот fallback, как только /api/roles/me появится.
 */
export function usePermissions() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['role-permissions', user?.id],
    queryFn: async () => {
      try {
        const role = await getMyRole();
        return role.permissions;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404 && user) {
          const role = await getRole(user.roleId);
          return role.permissions;
        }
        throw err;
      }
    },
    enabled: Boolean(user),
    staleTime: Infinity,
  });

  const permissions = data ?? [];

  function has(permission: string): boolean {
    return permissions.includes(permission);
  }

  function hasAny(...perms: string[]): boolean {
    return perms.some((p) => permissions.includes(p));
  }

  return { permissions, has, hasAny, isLoading };
}
