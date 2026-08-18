import { useQuery } from '@tanstack/react-query';
import { getMyRole } from '@/api/endpoints/roles';
import { useAuth } from './useAuth';

/**
 * Права роли запрашиваются один раз за сессию (staleTime: Infinity) через GET /api/roles/me
 * и кэшируются в React Query, а не в самом контексте — см. FRONTEND_TZ.md §5.4. Эндпоинт без
 * пермишен-гейта (в отличие от GET /api/roles/{id}, который требует Roles.Read и был бы
 * недоступен Cashier/Manager/Warehouse Worker/Accountant для чтения своих же прав).
 */
export function usePermissions() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['role-permissions', user?.id],
    queryFn: async () => {
      const role = await getMyRole();
      return role.permissions;
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
