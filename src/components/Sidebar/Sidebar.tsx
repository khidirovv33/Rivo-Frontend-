import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export interface SidebarItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Rivo</div>
      <nav className={styles.nav}>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
          >
            <span className={styles.icon}>
              <Icon width={18} height={18} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
