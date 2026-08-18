import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, TextField } from '@/components';
import * as returnsApi from '@/api/endpoints/returns';
import { extractErrorMessage } from '@/api/client';
import type { OrderDto } from '@/types/domain';
import formStyles from '../_shared/CrudForm.module.css';
import styles from './ReturnForm.module.css';

interface ReturnFormProps {
  order: OrderDto;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function ReturnForm({ order, onSubmitted, onCancel }: ReturnFormProps) {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      returnsApi.createReturn({
        orderId: order.id,
        reason: reason || undefined,
        items: Object.entries(quantities)
          .filter(([, qty]) => qty > 0)
          .map(([orderItemId, quantity]) => ({ orderItemId, quantity })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      onSubmitted();
    },
  });

  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

  return (
    <div>
      {mutation.isError && <div className={formStyles.error}>{extractErrorMessage(mutation.error)}</div>}
      {order.items.map((item) => (
        <div key={item.id} className={styles.row}>
          <span className={styles.name}>
            {item.productName}
            <br />
            <span className={styles.available}>Продано: {item.quantity}</span>
          </span>
          <input
            className={styles.qtyInput}
            type="number"
            min={0}
            max={item.quantity}
            value={quantities[item.id] ?? 0}
            onChange={(e) => {
              const value = Math.max(0, Math.min(item.quantity, Number(e.target.value) || 0));
              setQuantities((prev) => ({ ...prev, [item.id]: value }));
            }}
          />
        </div>
      ))}

      <div style={{ marginTop: 14 }}>
        <TextField label="Причина возврата (необязательно)" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      <div className={formStyles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={selectedCount === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Оформляем…' : 'Оформить возврат'}
        </Button>
      </div>
    </div>
  );
}
