import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '../icons';
import styles from './Sidebar.module.css';

export interface SidebarItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export type SidebarEntry =
  | { kind: 'item'; item: SidebarItem }
  | { kind: 'group'; id: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; items: SidebarItem[] };

interface SidebarProps {
  entries: SidebarEntry[];
  mobileOpen?: boolean;
  onClose?: () => void;
}

function isItemActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function findActiveGroupId(pathname: string, entries: SidebarEntry[]): string | null {
  for (const entry of entries) {
    if (entry.kind === 'group' && entry.items.some((item) => isItemActive(pathname, item.to))) {
      return entry.id;
    }
  }
  return null;
}

function NavItemLink({ to, label, icon: Icon, onNavigate }: SidebarItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
    >
      <span className={styles.icon}>
        <Icon width={18} height={18} />
      </span>
      {label}
    </NavLink>
  );
}

export function Sidebar({ entries, mobileOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const activeId = findActiveGroupId(location.pathname, entries);
    return new Set(activeId ? [activeId] : []);
  });

  // Группа с текущим экраном разворачивается сама; уже открытые пользователем группы не закрываются.
  useEffect(() => {
    const activeId = findActiveGroupId(location.pathname, entries);
    if (!activeId) return;
    setExpanded((prev) => (prev.has(activeId) ? prev : new Set(prev).add(activeId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      {mobileOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={[styles.sidebar, mobileOpen ? styles.sidebarOpen : ''].join(' ')}>
        <div className={styles.brand}>Rivo</div>
        <nav className={styles.nav}>
          {entries.map((entry) => {
            if (entry.kind === 'item') {
              return <NavItemLink key={entry.item.to} {...entry.item} onNavigate={onClose} />;
            }

          const isOpen = expanded.has(entry.id);
          const isGroupActive = entry.items.some((item) => isItemActive(location.pathname, item.to));
          const Icon = entry.icon;
          return (
            <div key={entry.id} className={styles.group}>
              <button
                type="button"
                className={[styles.link, styles.groupHeader, isGroupActive ? styles.linkActive : ''].join(' ')}
                onClick={() => toggleGroup(entry.id)}
                aria-expanded={isOpen}
              >
                <span className={styles.icon}>
                  <Icon width={18} height={18} />
                </span>
                <span className={styles.groupLabel}>{entry.label}</span>
                <ChevronDownIcon
                  width={14}
                  height={14}
                  className={[styles.groupChevron, isOpen ? styles.groupChevronOpen : ''].join(' ')}
                />
              </button>
              {isOpen && (
                <div className={styles.groupItems}>
                  {entry.items.map((item) => (
                    <NavItemLink key={item.to} {...item} onNavigate={onClose} />
                  ))}
                </div>
              )}
            </div>
          );
          })}
        </nav>
      </aside>
    </>
  );
}
