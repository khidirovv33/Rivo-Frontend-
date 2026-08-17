import { PageHeader } from '@/components';
import { Card } from '@/components';
import styles from './ComingSoon.module.css';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card className={styles.card}>
        <span className={styles.text}>Экран в разработке.</span>
      </Card>
    </div>
  );
}
