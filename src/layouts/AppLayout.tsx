import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssistantWidget, Sidebar, Topbar, type StoreOption } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { usePermissions } from '@/auth/usePermissions';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { getVisibleNavEntries } from '@/routes/navItems';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { has } = usePermissions();
  const { stores, isLoading, currentStore, currentBranch, selectBranch } = useStoreBranch();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const entries = getVisibleNavEntries(has, t);
  const storeOptions: StoreOption[] = stores.map((s) => ({
    id: s.id,
    name: s.name,
    branches: s.branches.map((b) => ({ id: b.id, name: b.name })),
  }));

  const currentLabel =
    currentStore && currentBranch
      ? `${currentStore.name} — ${currentBranch.name}`
      : isLoading
        ? t('topbar.loading')
        : t('topbar.storeNotSelected');

  return (
    <div className={styles.shell}>
      <Sidebar entries={entries} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
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
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <AssistantWidget />
    </div>
  );
}
