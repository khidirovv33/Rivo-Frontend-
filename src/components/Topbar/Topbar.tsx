import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, LogOutIcon, MenuIcon, StoreIcon } from '../icons';
import styles from './Topbar.module.css';

export interface StoreOption {
  id: string;
  name: string;
  branches: { id: string; name: string }[];
}

interface TopbarProps {
  stores: StoreOption[];
  currentStoreId: string | null;
  currentBranchId: string | null;
  onSelectBranch: (storeId: string, branchId: string) => void;
  currentLabel: string;
  userName: string;
  roleName: string;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export function Topbar({
  stores,
  currentStoreId,
  currentBranchId,
  onSelectBranch,
  currentLabel,
  userName,
  roleName,
  onLogout,
  onMenuClick,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.menuButton} onClick={onMenuClick} aria-label="Открыть меню">
        <MenuIcon width={20} height={20} />
      </button>
      <div className={styles.switcher} ref={menuRef}>
        <button type="button" className={styles.switcherButton} onClick={() => setOpen((v) => !v)}>
          <StoreIcon width={16} height={16} />
          <span className={styles.switcherLabel}>{currentLabel}</span>
          <ChevronDownIcon width={14} height={14} />
        </button>
        {open && (
          <div className={styles.menu}>
            {stores.length === 0 && <div className={styles.menuItem}>Нет магазинов</div>}
            {stores.map((store) => (
              <div key={store.id}>
                <div className={styles.menuGroupLabel}>{store.name}</div>
                {store.branches.map((branch) => {
                  const isActive = store.id === currentStoreId && branch.id === currentBranchId;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      className={[styles.menuItem, isActive ? styles.menuItemActive : ''].join(' ')}
                      onClick={() => {
                        onSelectBranch(store.id, branch.id);
                        setOpen(false);
                      }}
                    >
                      {branch.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.divider} />
      <div className={styles.user}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{roleName}</span>
        </div>
        <button type="button" className={styles.logoutButton} onClick={onLogout} title="Выйти">
          <LogOutIcon width={16} height={16} />
        </button>
      </div>
    </header>
  );
}
