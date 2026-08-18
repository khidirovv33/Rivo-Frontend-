import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="7" width="18" height="13" rx="1" />
        <path d="M3 7l2-4h14l2 4" />
        <path d="M9 12h6" />
      </svg>
      <span className={styles.message}>{message}</span>
      {action}
    </div>
  );
}
