import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, PageHeader, Select, Table, Td, TextField, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import * as receivingApi from '@/api/endpoints/receiving';
import * as suppliersApi from '@/api/endpoints/suppliers';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { extractErrorMessage } from '@/api/client';
import { PurchaseOrderStatus } from '@/types/domain';
import { useProductLookup } from '../_shared/useProductLookup';
import { PurchasesTabs } from './PurchasesTabs';
import styles from './ReceivingPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function ReceivingPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers-all'], queryFn: suppliersApi.listAllSuppliers });
  const supplierNameById = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.listAllWarehouses() });
  const warehouseNameById = useMemo(() => new Map(warehouses.map((w) => [w.id, w.name])), [warehouses]);

  const { data: eligibleOrders, isLoading: isListLoading } = useQuery({
    queryKey: ['purchase-orders', 'receivable'],
    queryFn: () => purchaseOrdersApi.listPurchaseOrders({ pageNumber: 1, pageSize: 100 }),
  });

  // Точная граница статусов, с которой можно начать приёмку, backend'ом явно не описана (нет
  // отдельного эндпоинта "доступно к приёмке") — берём Sent/Confirmed/PartiallyReceived как
  // разумное приближение.
  const receivable = useMemo(
    () =>
      (eligibleOrders?.items ?? []).filter(
        (o) =>
          o.status === PurchaseOrderStatus.Sent ||
          o.status === PurchaseOrderStatus.Confirmed ||
          o.status === PurchaseOrderStatus.PartiallyReceived,
      ),
    [eligibleOrders],
  );

  const {
    data: order,
    isLoading: isOrderLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchase-order', orderId],
    queryFn: () => purchaseOrdersApi.getPurchaseOrder(orderId),
    enabled: Boolean(orderId),
  });

  const { getName, getSku } = useProductLookup((order?.items ?? []).map((i) => i.productId));

  useEffect(() => {
    if (!order) return;
    const initial: Record<string, number> = {};
    for (const item of order.items) {
      initial[item.id] = 0;
    }
    setQuantities(initial);
    setNotes('');
  }, [order]);

  const receiveMutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([purchaseOrderItemId, quantityReceived]) => ({ purchaseOrderItemId, quantityReceived }));
      return receivingApi.createReceiving({ purchaseOrderId: orderId, items, notes: notes || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });

  // Отдельного Purchases.* права в каталоге нет — зона гейтится Inventory.Read/Create/Approve.
  const canReceive = has('Inventory.Create');
  const hasAnyQuantity = Object.values(quantities).some((q) => q > 0);

  return (
    <div>
      <PurchasesTabs />
      <PageHeader title="Приём товара" subtitle="Частичный приём — план и факт по каждой позиции" />

      <div className={styles.orderPicker}>
        <Select
          label="Заказ поставщику"
          value={orderId}
          onChange={(e) => setSearchParams(e.target.value ? { orderId: e.target.value } : {})}
        >
          <option value="">Выберите заказ для приёмки</option>
          {receivable.map((o) => (
            <option key={o.id} value={o.id}>
              {o.orderNumber} — {supplierNameById.get(o.supplierId) ?? '—'}
            </option>
          ))}
        </Select>
      </div>

      {!orderId && isListLoading && <Loader />}
      {!orderId && !isListLoading && receivable.length === 0 && (
        <EmptyState message="Нет заказов, ожидающих приёмки." />
      )}

      {orderId && isOrderLoading && <Loader />}
      {orderId && isError && <ErrorState onRetry={() => refetch()} />}

      {orderId && order && (
        <>
          <div className={styles.summaryRow}>
            <Badge tone="neutral">Заказ {order.orderNumber}</Badge>
            <span>{supplierNameById.get(order.supplierId) ?? '—'}</span>
            <span>{warehouseNameById.get(order.warehouseId) ?? '—'}</span>
          </div>

          {receiveMutation.error && (
            <div className={formStyles.error}>{extractErrorMessage(receiveMutation.error)}</div>
          )}
          {receiveMutation.isSuccess && !receiveMutation.isPending && (
            <div style={{ marginBottom: 12 }}>
              <Badge tone="good">Приход оформлен</Badge>
            </div>
          )}

          <Table>
            <thead>
              <tr>
                <Th>Товар</Th>
                <Th>Заказано</Th>
                <Th>Уже получено</Th>
                <Th>Осталось</Th>
                <Th>Принять сейчас</Th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const remaining = item.remainingQuantity;
                return (
                  <tr key={item.id}>
                    <Td>
                      {getName(item.productId)}
                      <br />
                      <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                        {getSku(item.productId)}
                      </span>
                    </Td>
                    <Td numeric>{item.quantity}</Td>
                    <Td numeric>{item.receivedQuantity}</Td>
                    <Td numeric>{remaining}</Td>
                    <Td>
                      <input
                        className={styles.qtyInput}
                        type="number"
                        min={0}
                        max={remaining}
                        disabled={remaining <= 0 || !canReceive}
                        value={quantities[item.id] ?? 0}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.min(remaining, Math.max(0, Number(e.target.value) || 0)),
                          }))
                        }
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {canReceive && (
            <div className={formStyles.form} style={{ marginTop: 14 }}>
              <TextField label="Комментарий (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className={formStyles.formActions}>
                <Button
                  variant="primary"
                  disabled={!hasAnyQuantity || receiveMutation.isPending}
                  onClick={() => receiveMutation.mutate()}
                >
                  {receiveMutation.isPending ? 'Оформляем…' : 'Оприходовать'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
