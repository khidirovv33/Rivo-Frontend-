import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import { formatMoney } from '@/lib/format';
import {
  recordPaymentSchema,
  type RecordPaymentFormInput,
  type RecordPaymentFormValues,
} from '@/lib/validation/inventory';
import type { PurchaseDto } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface RecordPaymentFormProps {
  purchase: PurchaseDto;
  onSubmit: (values: RecordPaymentFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function RecordPaymentForm({ purchase, onSubmit, onCancel, isSaving, serverError }: RecordPaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordPaymentFormInput, unknown, RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: { amount: purchase.outstandingAmount, notes: '' },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
        Задолженность: <span className="font-data">{formatMoney(purchase.outstandingAmount)}</span>
      </p>
      <TextField
        label="Сумма оплаты"
        type="number"
        step="0.01"
        min={0}
        error={errors.amount?.message}
        {...register('amount')}
      />
      <TextField label="Комментарий (необязательно)" error={errors.notes?.message} {...register('notes')} />
      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Сохраняем…' : 'Записать оплату'}
        </Button>
      </div>
    </form>
  );
}
