import { NavLink } from 'react-router-dom';
import styles from '../products/CatalogTabs.module.css';

const TABS = [
  { to: '/warehouse', label: 'Остатки', end: true },
  { to: '/warehouse/movements', label: 'История движений', end: false },
];

export function WarehouseTabs() {
  return (
    <nav className={styles.tabs}>
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => [styles.tab, isActive ? styles.tabActive : ''].join(' ')}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
