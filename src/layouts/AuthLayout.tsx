import { Outlet } from 'react-router-dom';
import { Card, LanguageSwitcher } from '@/components';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </div>
      <div className={styles.brand}>Rivo</div>
      <Card className={styles.card}>
        <Outlet />
      </Card>
    </div>
  );
}
