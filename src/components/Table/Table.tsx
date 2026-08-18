import type { TdHTMLAttributes, ThHTMLAttributes, TableHTMLAttributes } from 'react';
import styles from './Table.module.css';

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.wrapper}>
      <table className={[styles.table, className].filter(Boolean).join(' ')} {...rest} />
    </div>
  );
}

export function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} />;
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function Td({ numeric, className, ...rest }: TdProps) {
  return <td className={[numeric ? styles.numeric : '', className].filter(Boolean).join(' ')} {...rest} />;
}
