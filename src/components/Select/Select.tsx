import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>
      <select ref={ref} id={selectId} className={[styles.select, className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
});
