import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar, type StoreOption } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { usePermissions } from '@/auth/usePermissions';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { getVisibleNavItems } from '@/routes/navItems';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { has } = usePermissions();
  const { stores, isLoading, currentStore, currentBranch, selectBranch } = useStoreBranch();

  const items = getVisibleNavItems(has);
  const storeOptions: StoreOption[] = stores.map((s) => ({
    id: s.id,
    name: s.name,
    branches: s.branches.map((b) => ({ id: b.id, name: b.name })),
  }));

  const currentLabel =
    currentStore && currentBranch
      ? `${currentStore.name} — ${currentBranch.name}`
      : isLoading
        ? 'Загрузка…'
        : 'Магазин не выбран';

  return (
    <div className={styles.shell}>
      <Sidebar items={items} />
      <div className={styles.main}>
        <Topbar
          stores={storeOptions}
          currentStoreId={currentStore?.id ?? null}
          currentBranchId={currentBranch?.id ?? null}
          onSelectBranch={selectBranch}
          currentLabel={currentLabel}
          userName={user?.fullName ?? ''}
          roleName={user?.roleName ?? ''}
          onLogout={logout}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
