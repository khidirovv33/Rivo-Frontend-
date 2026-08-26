import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, StatCard, Table, Td, TextField, Th } from '@/components';
import * as ordersApi from '@/api/endpoints/orders';
import { formatDateTime, formatMoney } from '@/lib/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/pages/pos/labels';
import styles from './ReportsPage.module.css';

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function SalesReport() {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [exportNote, setExportNote] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports-sales-orders'],
    queryFn: () => ordersApi.listOrders({ pageNumber: 1, pageSize: 100, sortBy: 'createdAt', sortDescending: true }),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const fromTime = new Date(`${from}T00:00:00`).getTime();
    const toTime = new Date(`${to}T23:59:59`).getTime();
    return data.items.filter((order) => {
      const t = new Date(order.createdAt).getTime();
      return t >= fromTime && t <= toTime;
    });
  }, [data, from, to]);

  const revenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageCheck = filtered.length > 0 ? revenue / filtered.length : 0;

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.dateField}>
          <TextField label="С" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className={styles.dateField}>
          <TextField label="По" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={() => setExportNote(true)}>
          Экспорт
        </Button>
      </div>
      {exportNote && <p className={styles.exportNote}>Экспорт в PDF/Excel/CSV — функция в разработке.</p>}

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <div className={styles.summaryRow}>
            <StatCard label="Продаж" value={String(filtered.length)} />
            <StatCard label="Выручка" value={formatMoney(revenue)} />
            <StatCard label="Средний чек" value={formatMoney(averageCheck)} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState message="За выбранный период продаж нет." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Номер</Th>
                  <Th>Дата</Th>
                  <Th>Статус</Th>
                  <Th>Сумма</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <Td className="font-data">{order.orderNumber}</Td>
                    <Td className="font-data">{formatDateTime(order.createdAt)}</Td>
                    <Td>
                      <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                    </Td>
                    <Td numeric>{formatMoney(order.totalAmount)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
