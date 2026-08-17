import { Button } from '../Button/Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onChange: (page: number) => void;
}

export function Pagination({ pageNumber, totalPages, hasPreviousPage, hasNextPage, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        Стр. {pageNumber} из {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={!hasPreviousPage} onClick={() => onChange(pageNumber - 1)}>
        Назад
      </Button>
      <Button variant="secondary" size="sm" disabled={!hasNextPage} onClick={() => onChange(pageNumber + 1)}>
        Далее
      </Button>
    </div>
  );
}
