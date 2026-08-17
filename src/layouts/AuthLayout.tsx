import { Outlet } from 'react-router-dom';
import { Card } from '@/components';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>Rivo</div>
      <Card className={styles.card}>
        <Outlet />
      </Card>
    </div>
  );
}
