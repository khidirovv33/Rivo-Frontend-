import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Modal, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import { PurchaseOrderStatus, type PurchaseOrderDto } from '@/types/domain';
import { PURCHASE_ORDER_STATUS_LABEL, PURCHASE_ORDER_STATUS_TONE } from './labels';
import formStyles from '../_shared/CrudForm.module.css';

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrderDto | null;
  onClose: () => void;
  onReceive: (order: PurchaseOrderDto) => void;
  onUpdated: (order: PurchaseOrderDto) => void;
}

export function PurchaseOrderDetailModal({ order, onClose, onReceive, onUpdated }: PurchaseOrderDetailModalProps) {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.sendPurchaseOrder(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      onUpdated(updated);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.cancelPurchaseOrder(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      onUpdated(updated);
    },
  });

  if (!order) return null;

  const canUpdate = has('Purchases.Update');
  const canReceive = has('Purchases.Receive') || canUpdate;
  const mutationError = sendMutation.error ?? cancelMutation.error;

  return (
    <Modal open={Boolean(order)} onClose={onClose} title={`Заказ ${order.orderNumber}`}>
      <div className={formStyles.form}>
        {mutationError ? <div className={formStyles.error}>{extractErrorMessage(mutationError)}</div> : null}

        <div>
          <Badge tone={PURCHASE_ORDER_STATUS_TONE[order.status]}>{PURCHASE_ORDER_STATUS_LABEL[order.status]}</Badge>
        </div>

        <Table>
          <tbody>
            <tr>
              <Td>Поставщик</Td>
              <Td>{order.supplierName}</Td>
            </tr>
            <tr>
              <Td>Склад</Td>
              <Td>{order.warehouseName}</Td>
            </tr>
            <tr>
              <Td>Дата создания</Td>
              <Td className="font-data">{formatDate(order.createdAt)}</Td>
            </tr>
            {order.expectedDate && (
              <tr>
                <Td>Ожидаемая дата</Td>
                <Td className="font-data">{formatDate(order.expectedDate)}</Td>
              </tr>
            )}
            <tr>
              <Td>Сумма заказа</Td>
              <Td numeric>{formatMoney(order.totalAmount)}</Td>
            </tr>
            <tr>
              <Td>Оплачено</Td>
              <Td numeric>{formatMoney(order.paidAmount)}</Td>
            </tr>
            <tr>
              <Td>Задолженность</Td>
              <Td numeric>
                <Badge tone={order.debtAmount > 0 ? 'critical' : 'good'}>{formatMoney(order.debtAmount)}</Badge>
              </Td>
            </tr>
          </tbody>
        </Table>

        <Table>
          <thead>
            <tr>
              <Th>Товар</Th>
              <Th>Заказано</Th>
              <Th>Получено</Th>
              <Th>Осталось</Th>
              <Th>Цена</Th>
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
                  <Td numeric>
                    {remaining > 0 ? <Badge tone="warn">{remaining}</Badge> : <Badge tone="good">0</Badge>}
                  </Td>
                  <Td numeric>{formatMoney(item.unitPrice)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className={formStyles.formActions}>
          {order.status === PurchaseOrderStatus.Draft && canUpdate && (
            <>
              <Button variant="danger" onClick={() => cancelMutation.mutate(order.id)} disabled={cancelMutation.isPending}>
                Отменить
              </Button>
              <Button variant="primary" onClick={() => sendMutation.mutate(order.id)} disabled={sendMutation.isPending}>
                {sendMutation.isPending ? 'Отправляем…' : 'Отправить поставщику'}
              </Button>
            </>
          )}
          {(order.status === PurchaseOrderStatus.Sent || order.status === PurchaseOrderStatus.PartiallyReceived) && (
            <>
              {canUpdate && (
                <Button variant="danger" onClick={() => cancelMutation.mutate(order.id)} disabled={cancelMutation.isPending}>
                  Отменить
                </Button>
              )}
              {canReceive && (
                <Button variant="primary" onClick={() => onReceive(order)}>
                  Оприходовать
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}
