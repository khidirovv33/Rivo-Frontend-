import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, TextField, Th } from '@/components';
import * as ordersApi from '@/api/endpoints/orders';
import { formatDateTime, formatMoney } from '@/lib/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/pages/pos/labels';
import type { OrderDto } from '@/types/domain';
import { OrderDetailModal } from './OrderDetailModal';
import { ReturnForm } from './ReturnForm';
import styles from './SalesPage.module.css';

const PAGE_SIZE = 20;

export function SalesPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState<OrderDto | null>(null);
  const [returningOrder, setReturningOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orders', pageNumber, searchTerm],
    queryFn: () => ordersApi.listOrders({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  return (
    <div>
      <PageHeader title="Продажи" />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Номер заказа…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Продаж пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Номер</Th>
                <Th>Дата</Th>
                <Th>Статус</Th>
                <Th>Сумма</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((order) => (
                <tr key={order.id}>
                  <Td className="font-data">{order.orderNumber}</Td>
                  <Td className="font-data">{formatDateTime(order.createdAt)}</Td>
                  <Td>
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                  </Td>
                  <Td numeric>{formatMoney(order.totalAmount)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewingOrder(order)}>
                      Просмотреть
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            pageNumber={page.pageNumber}
            totalPages={page.totalPages}
            hasPreviousPage={page.hasPreviousPage}
            hasNextPage={page.hasNextPage}
            onChange={setPageNumber}
          />
        </>
      )}

      <OrderDetailModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onStartReturn={(order) => {
          setViewingOrder(null);
          setReturningOrder(order);
        }}
      />

      <Modal open={returningOrder !== null} onClose={() => setReturningOrder(null)} title="Оформить возврат">
        {returningOrder && (
          <ReturnForm
            order={returningOrder}
            onSubmitted={() => setReturningOrder(null)}
            onCancel={() => setReturningOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
