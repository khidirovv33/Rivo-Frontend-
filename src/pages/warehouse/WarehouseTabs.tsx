import { NavLink } from 'react-router-dom';
import styles from './WarehouseTabs.module.css';

const TABS = [
  { to: '/warehouse', label: 'Склады', end: true },
  { to: '/warehouse/stock', label: 'Остатки', end: false },
  { to: '/warehouse/movements', label: 'Движения', end: false },
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
