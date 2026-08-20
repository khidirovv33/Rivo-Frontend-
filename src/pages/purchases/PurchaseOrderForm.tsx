import { useState } from 'react';
import { Button, Select, Table, Td, TextField, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import { formatMoney } from '@/lib/format';
import { useSuppliersLookup, useWarehousesLookup } from '@/lib/lookups';
import { ProductPicker } from '../_shared/ProductPicker';
import type { CreatePurchaseOrderRequest } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface DraftLine {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export function PurchaseOrderForm({
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  onSubmit: (payload: CreatePurchaseOrderRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const { suppliers } = useSuppliersLookup();
  const { warehouses } = useWarehousesLookup();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? '');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
  const canSubmit = Boolean(supplierId) && Boolean(warehouseId) && lines.length > 0;

  function addLine(productId: string, productName: string) {
    if (lines.some((l) => l.productId === productId)) return;
    setLines((prev) => [...prev, { productId, productName, quantity: 1, unitCost: 0 }]);
  }

  function updateLine(productId: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      supplierId,
      warehouseId,
      expectedDate: expectedDate || undefined,
      notes: notes || undefined,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCost: l.unitCost })),
    });
  }

  return (
    <div className={styles.form}>
      {serverError && <div className={styles.error}>{serverError}</div>}

      <Select label="Поставщик" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <Select label="Склад" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>

      <TextField
        label="Ожидаемая дата поставки (необязательно)"
        type="date"
        value={expectedDate}
        onChange={(e) => setExpectedDate(e.target.value)}
      />

      <TextField label="Заметки (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <ProductPicker onPick={(product) => addLine(product.id, product.name)} />

      {lines.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Товар</Th>
              <Th>Кол-во</Th>
              <Th>Цена закупки</Th>
              <Th>Сумма</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.productId}>
                <Td>{line.productName}</Td>
                <Td>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.productId, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className={styles.inlineNumber}
                  />
                </Td>
                <Td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitCost}
                    onChange={(e) => updateLine(line.productId, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
                    className={styles.inlineNumber}
                  />
                </Td>
                <Td numeric className="font-data">{formatMoney(line.quantity * line.unitCost)}</Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => removeLine(line.productId)} aria-label="Удалить">
                    <TrashIcon width={15} height={15} />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className={styles.formActions}>
        <span className={styles.formTotal}>Итого: {formatMoney(total)}</span>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit || isSaving} onClick={handleSubmit}>
          {isSaving ? 'Создаём…' : 'Создать заказ'}
        </Button>
      </div>
    </div>
  );
}
