import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Loader, Table, Td, Th } from '@/components';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import { useProductName, useSuppliersLookup, useWarehousesLookup } from '@/lib/lookups';
import { PurchaseOrderStatus } from '@/types/domain';
import { PURCHASE_ORDER_STATUS_LABEL, PURCHASE_ORDER_STATUS_TONE } from './labels';
import styles from '../_shared/CrudForm.module.css';

function ProductCell({ productId }: { productId: string }) {
  const name = useProductName(productId);
  return <>{name ?? '…'}</>;
}

export function PurchaseOrderDetail({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { nameOf: supplierName } = useSuppliersLookup();
  const { nameOf: warehouseName } = useWarehousesLookup();

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-order', orderId],
    queryFn: () => purchaseOrdersApi.getPurchaseOrder(orderId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['purchase-order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  }

  const sendMutation = useMutation({ mutationFn: () => purchaseOrdersApi.sendPurchaseOrder(orderId), onSuccess: invalidate });
  const confirmMutation = useMutation({ mutationFn: () => purchaseOrdersApi.confirmPurchaseOrder(orderId), onSuccess: invalidate });
  const cancelMutation = useMutation({ mutationFn: () => purchaseOrdersApi.cancelPurchaseOrder(orderId), onSuccess: invalidate });

  const busy = sendMutation.isPending || confirmMutation.isPending || cancelMutation.isPending;
  const error = sendMutation.error ?? confirmMutation.error ?? cancelMutation.error;

  if (isLoading || !order) {
    return <Loader />;
  }

  return (
    <div className={styles.form}>
      {error && <div className={styles.error}>{extractErrorMessage(error)}</div>}

      <div>
        <Badge tone={PURCHASE_ORDER_STATUS_TONE[order.status]}>{PURCHASE_ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      <div>
        <div>Поставщик: {supplierName(order.supplierId)}</div>
        <div>Склад: {warehouseName(order.warehouseId)}</div>
        <div>Дата заказа: {formatDate(order.orderDate)}</div>
        {order.expectedDate && <div>Ожидается: {formatDate(order.expectedDate)}</div>}
        {order.notes && <div>Заметки: {order.notes}</div>}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Товар</Th>
            <Th>Кол-во</Th>
            <Th>Получено</Th>
            <Th>Цена</Th>
            <Th>Сумма</Th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <Td>
                <ProductCell productId={item.productId} />
              </Td>
              <Td numeric className="font-data">{item.quantity}</Td>
              <Td numeric className="font-data">{item.receivedQuantity}</Td>
              <Td numeric className="font-data">{formatMoney(item.unitCost)}</Td>
              <Td numeric className="font-data">{formatMoney(item.quantity * item.unitCost)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className={styles.formActions}>
        <span className={styles.formTotal}>Итого: {formatMoney(order.totalAmount)}</span>
        <Button type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
        {order.status === PurchaseOrderStatus.Draft && (
          <Button variant="primary" disabled={busy} onClick={() => sendMutation.mutate()}>
            Отправить
          </Button>
        )}
        {order.status === PurchaseOrderStatus.Sent && (
          <Button variant="primary" disabled={busy} onClick={() => confirmMutation.mutate()}>
            Подтвердить
          </Button>
        )}
        {(order.status === PurchaseOrderStatus.Draft ||
          order.status === PurchaseOrderStatus.Sent ||
          order.status === PurchaseOrderStatus.Confirmed) && (
          <Button variant="ghost" disabled={busy} onClick={() => cancelMutation.mutate()}>
            Отменить
          </Button>
        )}
      </div>
    </div>
  );
}
