import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select, Table, Td, TextField, Th } from '@/components';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import { useProductName, useSuppliersLookup } from '@/lib/lookups';
import { PurchaseOrderStatus } from '@/types/domain';
import type { CreateReceivingRequest } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

const RECEIVABLE_STATUSES = new Set<number>([
  PurchaseOrderStatus.Sent,
  PurchaseOrderStatus.Confirmed,
  PurchaseOrderStatus.PartiallyReceived,
]);

function ProductCell({ productId }: { productId: string }) {
  const name = useProductName(productId);
  return <>{name ?? '…'}</>;
}

export function ReceivingForm({
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  onSubmit: (payload: CreateReceivingRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const { nameOf: supplierName } = useSuppliersLookup();
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: orders } = useQuery({
    queryKey: ['purchase-orders-receivable'],
    queryFn: () => purchaseOrdersApi.listPurchaseOrders({ pageNumber: 1, pageSize: 100 }),
  });

  const receivableOrders = (orders?.items ?? []).filter((o) => RECEIVABLE_STATUSES.has(o.status));

  const { data: order } = useQuery({
    queryKey: ['purchase-order', purchaseOrderId],
    queryFn: () => purchaseOrdersApi.getPurchaseOrder(purchaseOrderId),
    enabled: Boolean(purchaseOrderId),
  });

  function quantityFor(purchaseOrderItemId: string, remaining: number) {
    return quantities[purchaseOrderItemId] ?? remaining;
  }

  const pendingItems = (order?.items ?? []).filter((item) => item.quantity - item.receivedQuantity > 0);
  const canSubmit = Boolean(purchaseOrderId) && pendingItems.some((item) => quantityFor(item.id, item.quantity - item.receivedQuantity) > 0);

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      purchaseOrderId,
      notes: notes || undefined,
      items: pendingItems
        .map((item) => ({
          purchaseOrderItemId: item.id,
          quantityReceived: quantityFor(item.id, item.quantity - item.receivedQuantity),
        }))
        .filter((line) => line.quantityReceived > 0),
    });
  }

  return (
    <div className={styles.form}>
      {serverError && <div className={styles.error}>{serverError}</div>}

      <Select
        label="Заказ поставщику"
        value={purchaseOrderId}
        onChange={(e) => {
          setPurchaseOrderId(e.target.value);
          setQuantities({});
        }}
      >
        <option value="">Выберите заказ…</option>
        {receivableOrders.map((o) => (
          <option key={o.id} value={o.id}>
            {o.orderNumber} — {supplierName(o.supplierId)}
          </option>
        ))}
      </Select>

      <TextField label="Заметки (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {order && pendingItems.length === 0 && <p>Все позиции заказа уже получены.</p>}

      {pendingItems.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Товар</Th>
              <Th>Заказано</Th>
              <Th>Уже получено</Th>
              <Th>Получить сейчас</Th>
            </tr>
          </thead>
          <tbody>
            {pendingItems.map((item) => {
              const remaining = item.quantity - item.receivedQuantity;
              return (
                <tr key={item.id}>
                  <Td>
                    <ProductCell productId={item.productId} />
                  </Td>
                  <Td numeric className="font-data">{item.quantity}</Td>
                  <Td numeric className="font-data">{item.receivedQuantity}</Td>
                  <Td numeric>
                    <input
                      type="number"
                      min={0}
                      max={remaining}
                      step="1"
                      value={quantityFor(item.id, remaining)}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.max(0, Math.min(remaining, Number(e.target.value) || 0)),
                        }))
                      }
                      className={styles.inlineNumber}
                    />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit || isSaving} onClick={handleSubmit}>
          {isSaving ? 'Сохраняем…' : 'Оформить приёмку'}
        </Button>
      </div>
    </div>
  );
}
