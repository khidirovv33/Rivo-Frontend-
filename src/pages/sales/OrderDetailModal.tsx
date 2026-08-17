import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Loader, Modal, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as paymentsApi from '@/api/endpoints/payments';
import { formatDateTime, formatMoney } from '@/lib/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_METHOD_LABEL } from '@/pages/pos/labels';
import type { OrderDto } from '@/types/domain';
import styles from './OrderDetailModal.module.css';

interface OrderDetailModalProps {
  order: OrderDto | null;
  onClose: () => void;
  onStartReturn: (order: OrderDto) => void;
}

export function OrderDetailModal({ order, onClose, onStartReturn }: OrderDetailModalProps) {
  const { has } = usePermissions();
  const { data: payments, isLoading } = useQuery({
    queryKey: ['order-payments', order?.id],
    queryFn: () => paymentsApi.getPaymentsByOrder(order!.id),
    enabled: order !== null,
  });

  return (
    <Modal open={order !== null} onClose={onClose} title={order ? order.orderNumber : ''}>
      {order && (
        <div>
          <div className={styles.meta}>
            <span className="font-data">{formatDateTime(order.createdAt)}</span>
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          </div>

          <div className={styles.sectionTitle}>Товары</div>
          <Table>
            <thead>
              <tr>
                <Th>Товар</Th>
                <Th>Кол-во</Th>
                <Th>Цена</Th>
                <Th>Сумма</Th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <Td>{item.productName}</Td>
                  <Td numeric>{item.quantity}</Td>
                  <Td numeric>{formatMoney(item.unitPrice)}</Td>
                  <Td numeric>{formatMoney(item.lineTotal)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className={styles.totalsRow}>
            <span>Подытог</span>
            <span className="font-data">{formatMoney(order.subTotal)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Скидка</span>
            <span className="font-data">-{formatMoney(order.discountAmount)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Налог</span>
            <span className="font-data">{formatMoney(order.taxAmount)}</span>
          </div>
          <div className={styles.totalsRowMain}>
            <span>Итого</span>
            <span className="font-data">{formatMoney(order.totalAmount)}</span>
          </div>

          <div className={styles.sectionTitle}>Оплата</div>
          {isLoading && <Loader />}
          {payments?.map((payment) => (
            <div key={payment.id} className={styles.totalsRow}>
              <span>{PAYMENT_METHOD_LABEL[payment.method]}</span>
              <span className="font-data">{formatMoney(payment.amount)}</span>
            </div>
          ))}

          {has('Sales.Return') && (
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => onStartReturn(order)}>
                Оформить возврат
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
