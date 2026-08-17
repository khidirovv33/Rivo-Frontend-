import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, TextField } from '@/components';
import { CheckIcon } from '@/components/icons';
import * as posApi from '@/api/endpoints/pos';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import type { OrderDto } from '@/types/domain';
import styles from './ReceiptPanel.module.css';

interface ReceiptPanelProps {
  order: OrderDto;
  onNewSale: () => void;
}

export function ReceiptPanel({ order, onNewSale }: ReceiptPanelProps) {
  const [email, setEmail] = useState('');

  const downloadMutation = useMutation({
    mutationFn: () => posApi.getReceiptPdf(order.id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
  });

  const emailMutation = useMutation({
    mutationFn: () => posApi.emailReceipt(order.id, email),
  });

  return (
    <div className={styles.wrapper}>
      <CheckIcon className={styles.icon} width={40} height={40} />
      <div>
        <div className={styles.orderNumber}>{order.orderNumber}</div>
        <div className={styles.total}>{formatMoney(order.totalAmount)}</div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
          {downloadMutation.isPending ? 'Готовим…' : 'Скачать чек'}
        </Button>
      </div>

      <div className={styles.emailRow}>
        <div className={styles.emailField}>
          <TextField
            label="Отправить на email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => emailMutation.mutate()}
          disabled={!email || emailMutation.isPending}
        >
          {emailMutation.isPending ? 'Отправляем…' : 'Отправить'}
        </Button>
      </div>
      {emailMutation.isSuccess && <span className={styles.status}>Чек отправлен на {email}</span>}
      {emailMutation.isError && <span className={styles.status} style={{ color: 'var(--critical)' }}>{extractErrorMessage(emailMutation.error)}</span>}
      {downloadMutation.isError && (
        <span className={styles.status} style={{ color: 'var(--critical)' }}>{extractErrorMessage(downloadMutation.error)}</span>
      )}

      <Button variant="primary" onClick={onNewSale}>
        Новая продажа
      </Button>
    </div>
  );
}
