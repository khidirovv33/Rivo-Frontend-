import { useState } from 'react';
import { Button, Select, Table, Td, TextField, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import { useWarehousesLookup } from '@/lib/lookups';
import { ProductPicker } from '../_shared/ProductPicker';
import type { CreateTransferRequest } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface DraftLine {
  productId: string;
  productName: string;
  quantity: number;
}

export function TransferForm({
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  onSubmit: (payload: CreateTransferRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const { warehouses } = useWarehousesLookup();
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id ?? '');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[1]?.id ?? warehouses[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);

  const canSubmit =
    Boolean(sourceWarehouseId) &&
    Boolean(destinationWarehouseId) &&
    sourceWarehouseId !== destinationWarehouseId &&
    lines.length > 0;

  function addLine(productId: string, productName: string) {
    if (lines.some((l) => l.productId === productId)) return;
    setLines((prev) => [...prev, { productId, productName, quantity: 1 }]);
  }

  function updateLine(productId: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      sourceWarehouseId,
      destinationWarehouseId,
      notes: notes || undefined,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
  }

  return (
    <div className={styles.form}>
      {serverError && <div className={styles.error}>{serverError}</div>}

      <Select label="Склад-отправитель" value={sourceWarehouseId} onChange={(e) => setSourceWarehouseId(e.target.value)}>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>

      <Select
        label="Склад-получатель"
        value={destinationWarehouseId}
        onChange={(e) => setDestinationWarehouseId(e.target.value)}
      >
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>
      {sourceWarehouseId === destinationWarehouseId && (
        <div className={styles.error}>Склад-отправитель и склад-получатель должны отличаться.</div>
      )}

      <TextField label="Заметки (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <ProductPicker onPick={(product) => addLine(product.id, product.name)} />

      {lines.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Товар</Th>
              <Th>Кол-во</Th>
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
                    onChange={(e) => updateLine(line.productId, Math.max(1, Number(e.target.value) || 1))}
                    className={styles.inlineNumber}
                  />
                </Td>
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit || isSaving} onClick={handleSubmit}>
          {isSaving ? 'Создаём…' : 'Создать перемещение'}
        </Button>
      </div>
    </div>
  );
}
