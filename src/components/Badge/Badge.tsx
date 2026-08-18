import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'good' | 'warn' | 'critical' | 'neutral';
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')} {...rest} />;
}
