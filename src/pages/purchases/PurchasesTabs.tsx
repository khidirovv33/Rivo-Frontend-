import { NavLink } from 'react-router-dom';
import styles from './PurchasesTabs.module.css';

const TABS = [
  { to: '/purchases', label: 'Заказы поставщикам', end: true },
  { to: '/purchases/receiving', label: 'Приёмки', end: false },
  { to: '/purchases/invoices', label: 'Оплаты', end: false },
  { to: '/purchases/suppliers', label: 'Поставщики', end: false },
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
