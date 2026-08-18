import { NavLink } from 'react-router-dom';
import styles from '../products/CatalogTabs.module.css';

const TABS = [
  { to: '/purchases', label: 'Закупки', end: true },
  { to: '/purchases/receiving', label: 'Приём товара', end: false },
  { to: '/suppliers', label: 'Поставщики', end: false },
];

export function PurchasesTabs() {
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
