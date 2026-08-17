import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, TextField } from '@/components';
import { CloseIcon } from '@/components/icons';
import * as customersApi from '@/api/endpoints/customers';
import * as loyaltyApi from '@/api/endpoints/loyalty';
import type { CustomerDto } from '@/types/domain';
import styles from './CustomerPicker.module.css';

interface CustomerPickerProps {
  customer: CustomerDto | null;
  loyaltyDiscountPercentage: number | null;
  onSelect: (customer: CustomerDto | null, loyaltyDiscountPercentage: number | null) => void;
}

export function CustomerPicker({ customer, loyaltyDiscountPercentage, onSelect }: CustomerPickerProps) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: results } = useQuery({
    queryKey: ['pos-customer-search', debounced],
    queryFn: () => customersApi.listCustomers({ searchTerm: debounced, pageSize: 8 }),
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

  async function pick(selected: CustomerDto) {
    setOpen(false);
    setTerm('');
    setDebounced('');
    const card = await loyaltyApi.getLoyaltyCardByCustomer(selected.id).catch(() => null);
    const discount = card?.isActive ? card.loyaltyLevelDiscountPercentage : null;
    onSelect(selected, discount ?? null);
  }

  if (customer) {
    return (
      <div className={styles.selected}>
        <span>
          <span className={styles.selectedName}>{customer.fullName}</span>
          {loyaltyDiscountPercentage != null && loyaltyDiscountPercentage > 0 && (
            <>
              <br />
              <span className={styles.selectedMeta}>Скидка по карте лояльности: {loyaltyDiscountPercentage}%</span>
            </>
          )}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null, null)} aria-label="Убрать клиента">
          <CloseIcon width={14} height={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <TextField
        label="Клиент (необязательно)"
        placeholder="Поиск по имени или телефону…"
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
          {results && results.items.length === 0 && <div className={styles.empty}>Клиенты не найдены</div>}
          {results?.items.map((c) => (
            <div key={c.id} className={styles.resultRow} onClick={() => pick(c)}>
              <span>{c.fullName}</span>
              <span className="font-data">{c.phone ?? ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
