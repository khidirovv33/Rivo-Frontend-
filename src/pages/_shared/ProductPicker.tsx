import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '@/components';
import { SearchIcon } from '@/components/icons';
import * as productsApi from '@/api/endpoints/products';
import { formatMoney } from '@/lib/format';
import type { ProductDto } from '@/types/domain';
import styles from './ProductPicker.module.css';

/** Простой автокомплит для строчного добавления товара в заказ/приёмку/перемещение/ревизию — без вариаций. */
export function ProductPicker({ onPick }: { onPick: (product: ProductDto) => void }) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: results } = useQuery({
    queryKey: ['product-picker-search', debounced],
    queryFn: () => productsApi.listProducts({ searchTerm: debounced, pageSize: 8 }),
    enabled: debounced.length > 0,
  });

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function pick(product: ProductDto) {
    onPick(product);
    setTerm('');
    setDebounced('');
    setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <TextField
        label="Добавить товар"
        placeholder="Название или SKU…"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && debounced && (
        <div className={styles.results}>
          {!results && <div className={styles.empty}>Ищем…</div>}
          {results && results.items.length === 0 && (
            <div className={styles.empty}>
              <SearchIcon width={14} height={14} /> Ничего не найдено
            </div>
          )}
          {results?.items.map((product) => (
            <div key={product.id} className={styles.resultRow} onClick={() => pick(product)}>
              <span>
                <span className={styles.resultName}>{product.name}</span>
                <br />
                <span className={[styles.resultMeta, 'font-data'].join(' ')}>{product.sku}</span>
              </span>
              <span className={[styles.resultPrice, 'font-data'].join(' ')}>{formatMoney(product.purchasePrice)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
