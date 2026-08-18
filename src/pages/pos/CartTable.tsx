import { Button, EmptyState, Table, Td, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import { formatMoney } from '@/lib/format';
import type { CalcLine } from './calc';
import type { CartItem } from './types';
import styles from './CartTable.module.css';

interface CartTableProps {
  items: CartItem[];
  lines: CalcLine[];
  onUpdate: (key: string, patch: Partial<CartItem>) => void;
  onRemove: (key: string) => void;
}

export function CartTable({ items, lines, onUpdate, onRemove }: CartTableProps) {
  if (items.length === 0) {
    return <EmptyState message="Корзина пуста. Найдите товар выше, чтобы добавить его." />;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Товар</Th>
          <Th>Цена</Th>
          <Th>Кол-во</Th>
          <Th>Скидка</Th>
          <Th>Сумма</Th>
          <Th />
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.key}>
            <Td>
              {item.name}
              {item.variationLabel && <span style={{ color: 'var(--ink-faint)' }}> · {item.variationLabel}</span>}
              <br />
              <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                {item.sku}
              </span>
            </Td>
            <Td numeric>{formatMoney(item.unitPrice)}</Td>
            <Td>
              <input
                className={styles.qtyInput}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onUpdate(item.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Td>
            <Td>
              <input
                className={styles.discountInput}
                type="number"
                min={0}
                step="0.01"
                value={item.discountAmount}
                onChange={(e) => onUpdate(item.key, { discountAmount: Math.max(0, Number(e.target.value) || 0) })}
              />
            </Td>
            <Td numeric>{formatMoney(lines[index]?.lineTotal ?? 0)}</Td>
            <Td>
              <Button variant="ghost" size="sm" onClick={() => onRemove(item.key)} aria-label="Убрать из корзины">
                <TrashIcon width={15} height={15} />
              </Button>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
