import { NavLink } from 'react-router-dom';
import styles from '../products/CatalogTabs.module.css';

const TABS = [
  { to: '/customers', label: 'Клиенты', end: true },
  { to: '/customers/loyalty-levels', label: 'Уровни лояльности', end: false },
];

export function CustomerTabs() {
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
