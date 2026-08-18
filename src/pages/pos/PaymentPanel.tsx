import { Button, Select, TextField } from '@/components';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { formatMoney } from '@/lib/format';
import { PaymentMethod } from '@/types/domain';
import { paymentsMatchTotal } from './calc';
import { PAYMENT_METHOD_LABEL } from './labels';
import styles from './PaymentPanel.module.css';

export interface PaymentRow {
  id: string;
  method: number;
  amount: number;
}

interface PaymentPanelProps {
  payments: PaymentRow[];
  total: number;
  onChange: (payments: PaymentRow[]) => void;
}

export function PaymentPanel({ payments, total, onChange }: PaymentPanelProps) {
  const sum = payments.reduce((acc, p) => acc + (Number.isFinite(p.amount) ? p.amount : 0), 0);
  const matches = paymentsMatchTotal(sum, total);

  function updateRow(id: string, patch: Partial<PaymentRow>) {
    onChange(payments.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function removeRow(id: string) {
    onChange(payments.filter((p) => p.id !== id));
  }

  function addRow() {
    onChange([...payments, { id: crypto.randomUUID(), method: PaymentMethod.Cash, amount: 0 }]);
  }

  function payFull() {
    onChange([{ id: crypto.randomUUID(), method: PaymentMethod.Cash, amount: total }]);
  }

  return (
    <div>
      {payments.map((payment) => (
        <div key={payment.id} className={styles.row}>
          <div className={styles.method}>
            <Select
              label="Способ"
              value={payment.method}
              onChange={(e) => updateRow(payment.id, { method: Number(e.target.value) })}
            >
              {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles.amount}>
            <TextField
              label="Сумма"
              type="number"
              step="0.01"
              value={payment.amount}
              onChange={(e) => updateRow(payment.id, { amount: Number(e.target.value) })}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeRow(payment.id)} aria-label="Удалить">
            <TrashIcon width={15} height={15} />
          </Button>
        </div>
      ))}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <PlusIcon width={14} height={14} />
          Добавить оплату
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={payFull}>
          Оплатить полностью
        </Button>
      </div>

      <div className={styles.summary}>
        <span>Внесено</span>
        <span className={['font-data', matches ? styles.match : styles.mismatch].join(' ')}>
          {formatMoney(sum)} {matches ? '' : `(нужно ${formatMoney(total)})`}
        </span>
      </div>
    </div>
  );
}
