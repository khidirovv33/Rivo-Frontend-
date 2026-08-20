import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import * as stockMovementsApi from '@/api/endpoints/stockMovements';
import { useProductName, useWarehousesLookup } from '@/lib/lookups';
import { formatDateTime } from '@/lib/format';
import { STOCK_MOVEMENT_LABEL, STOCK_MOVEMENT_TONE } from './labels';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePages.module.css';

const PAGE_SIZE = 20;

function ProductCell({ productId }: { productId: string }) {
  const name = useProductName(productId);
  return <>{name ?? '…'}</>;
}

export function StockMovementsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const { warehouses, nameOf } = useWarehousesLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stock-movements', pageNumber, warehouseId],
    queryFn: () =>
      stockMovementsApi.listStockMovements({ pageNumber, pageSize: PAGE_SIZE, warehouseId: warehouseId || undefined }),
  });

  return (
    <div>
      <WarehouseTabs />
      <PageHeader title="Движения склада" />

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
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Движений пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Дата</Th>
                <Th>Товар</Th>
                <Th>Склад</Th>
                <Th>Тип</Th>
                <Th>Было</Th>
                <Th>Дельта</Th>
                <Th>Стало</Th>
                <Th>Причина</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((movement) => (
                <tr key={movement.id}>
                  <Td className="font-data">{formatDateTime(movement.createdAt)}</Td>
                  <Td>
                    <ProductCell productId={movement.productId} />
                  </Td>
                  <Td>{nameOf(movement.warehouseId)}</Td>
                  <Td>
                    <Badge tone={STOCK_MOVEMENT_TONE[movement.type]}>{STOCK_MOVEMENT_LABEL[movement.type]}</Badge>
                  </Td>
                  <Td numeric className="font-data">{movement.quantityBefore}</Td>
                  <Td numeric className="font-data">
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </Td>
                  <Td numeric className="font-data">{movement.quantityAfter}</Td>
                  <Td>{movement.reason ?? '—'}</Td>
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
