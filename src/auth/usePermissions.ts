import { useQuery } from '@tanstack/react-query';
import { getRole } from '@/api/endpoints/roles';
import { useAuth } from './useAuth';

/**
 * Права роли запрашиваются один раз за сессию (staleTime: Infinity) через GET /api/roles/{roleId}
 * и кэшируются в React Query, а не в самом контексте — см. FRONTEND_TZ.md §5.4.
 *
 * ВНИМАНИЕ: GET /api/roles/{id} на бэкенде защищён правом `Roles.Read` (RolesController.cs).
 * По DefaultRolePermissions.cs этим правом обладают только Owner/Admin/Auditor — у Manager,
 * Cashier, Warehouse Worker, Accountant его нет, т.е. они получат 403 при попытке прочитать
 * СВОИ ЖЕ права. Это, по всей видимости, недосмотр в бэкенде (там же нет другого способа узнать
 * список прав своей роли — GET /api/permissions защищён тем же правом). Здесь это обрабатывается
 * мягко: 403 → пустой список прав (fail closed, кнопки скрываются), чтобы приложение не падало —
 * но для ролей кроме Owner/Admin/Auditor это означает, что скрытие по правам сейчас не будет
 * работать корректно, пока это не поправят на бэкенде.
 */
export function usePermissions() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['role-permissions', user?.roleId],
    queryFn: async () => {
      try {
        const role = await getRole(user!.roleId);
        return role.permissions;
      } catch {
        return [] as string[];
      }
    },
    enabled: Boolean(user?.roleId),
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
