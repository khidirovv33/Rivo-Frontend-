import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import * as stockApi from '@/api/endpoints/stock';
import { useWarehousesLookup } from '@/lib/lookups';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePages.module.css';

const PAGE_SIZE = 20;

export function StockPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const { warehouses } = useWarehousesLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stock', pageNumber, warehouseId],
    queryFn: () => stockApi.listStock({ pageNumber, pageSize: PAGE_SIZE, warehouseId: warehouseId || undefined }),
  });

  return (
    <div>
      <WarehouseTabs />
      <PageHeader title="Остатки" />

      <div className={styles.toolbar}>
        <div className={styles.filter}>
          <Select
            label="Склад"
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">Все склады</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Остатков не найдено." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Товар</Th>
                <Th>Склад</Th>
                <Th>Учётный остаток</Th>
                <Th>Резерв</Th>
                <Th>Доступно</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((stock) => (
                <tr key={stock.id}>
                  <Td>{stock.productName}</Td>
                  <Td>{stock.warehouseName}</Td>
                  <Td numeric className="font-data">{stock.systemQuantity}</Td>
                  <Td numeric className="font-data">{stock.reservedQuantity}</Td>
                  <Td numeric className="font-data">{stock.availableQuantity}</Td>
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
    </div>
  );
}
