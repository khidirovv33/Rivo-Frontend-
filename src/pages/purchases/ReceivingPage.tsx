import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, PageHeader, Select, Table, Td, TextField, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import * as receivingApi from '@/api/endpoints/receiving';
import { extractErrorMessage } from '@/api/client';
import { PurchaseOrderStatus } from '@/types/domain';
import { PurchasesTabs } from './PurchasesTabs';
import styles from './ReceivingPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function ReceivingPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const { data: eligibleOrders, isLoading: isListLoading } = useQuery({
    queryKey: ['purchase-orders', 'receivable'],
    queryFn: () => purchaseOrdersApi.listPurchaseOrders({ pageNumber: 1, pageSize: 100 }),
  });

  const receivable = useMemo(
    () =>
      (eligibleOrders?.items ?? []).filter(
        (o) => o.status === PurchaseOrderStatus.Sent || o.status === PurchaseOrderStatus.PartiallyReceived,
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

  useEffect(() => {
    if (!order) return;
    const initial: Record<string, number> = {};
    for (const item of order.items) {
      initial[item.id] = 0;
    }
    setQuantities(initial);
    setNote('');
  }, [order]);

  const receiveMutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([purchaseOrderItemId, quantityReceived]) => ({ purchaseOrderItemId, quantityReceived }));
      return receivingApi.createReceiving({ purchaseOrderId: orderId, items, note: note || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });

  const canReceive = has('Purchases.Receive') || has('Purchases.Update');
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
              {o.orderNumber} — {o.supplierName}
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
            <span>{order.supplierName}</span>
            <span>{order.warehouseName}</span>
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
                const remaining = item.quantityOrdered - item.quantityReceived;
                return (
                  <tr key={item.id}>
                    <Td>
                      {item.productName}
                      <br />
                      <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                        {item.productSku}
                      </span>
                    </Td>
                    <Td numeric>{item.quantityOrdered}</Td>
                    <Td numeric>{item.quantityReceived}</Td>
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
              <TextField label="Комментарий (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
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
