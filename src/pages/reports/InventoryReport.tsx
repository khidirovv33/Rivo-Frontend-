import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, EmptyState, ErrorState, Loader, StatCard, Table, Td, Th } from '@/components';
import * as stockApi from '@/api/endpoints/stock';
import { useProductsLookup, useWarehousesLookup } from '@/lib/lookups';
import { formatMoney } from '@/lib/format';
import styles from './ReportsPage.module.css';

export function InventoryReport() {
  const [exportNote, setExportNote] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports-inventory-stock'],
    queryFn: () => stockApi.listStock({ pageNumber: 1, pageSize: 100 }),
  });
  const { nameOf: warehouseNameOf } = useWarehousesLookup();
  const { nameOf: productNameOf } = useProductsLookup();

  const items = data?.items ?? [];
  const totalSystem = items.reduce((sum, s) => sum + s.systemQuantity, 0);
  const totalAvailable = items.reduce((sum, s) => sum + s.availableQuantity, 0);

  return (
    <div>
      <div className={styles.toolbar}>
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
            <StatCard label="Позиций" value={String(items.length)} />
            <StatCard label="Системный остаток" value={formatMoney(totalSystem)} />
            <StatCard label="Доступно" value={formatMoney(totalAvailable)} />
          </div>

          {items.length === 0 ? (
            <EmptyState message="Остатков пока нет." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Товар</Th>
                  <Th>Склад</Th>
                  <Th>Системное кол-во</Th>
                  <Th>Резерв</Th>
                  <Th>Доступно</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((stock) => (
                  <tr key={stock.id}>
                    <Td>{productNameOf(stock.productId)}</Td>
                    <Td>{warehouseNameOf(stock.warehouseId)}</Td>
                    <Td numeric>{stock.systemQuantity}</Td>
                    <Td numeric>{stock.reservedQuantity}</Td>
                    <Td numeric>{stock.availableQuantity}</Td>
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
