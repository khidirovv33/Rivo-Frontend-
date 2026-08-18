import { NavLink } from 'react-router-dom';
import styles from './CatalogTabs.module.css';

const TABS = [
  { to: '/products', label: 'Товары', end: true },
  { to: '/products/categories', label: 'Категории', end: false },
  { to: '/products/brands', label: 'Бренды', end: false },
];

export function CatalogTabs() {
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
