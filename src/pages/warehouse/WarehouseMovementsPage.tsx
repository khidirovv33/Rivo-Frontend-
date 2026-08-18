import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import * as stockMovementsApi from '@/api/endpoints/stockMovements';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { formatDateTime } from '@/lib/format';
import { StockMovementType } from '@/types/domain';
import { STOCK_MOVEMENT_TYPE_LABEL, STOCK_MOVEMENT_TYPE_TONE } from './labels';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePage.module.css';

const PAGE_SIZE = 20;

export function WarehouseMovementsPage() {
  const { currentBranch } = useStoreBranch();

  const [pageNumber, setPageNumber] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setPageNumber(1);
  }, [warehouseId, type]);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', currentBranch?.id],
    queryFn: () => warehousesApi.listAllWarehouses(currentBranch!.id),
    enabled: Boolean(currentBranch),
  });

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stock-movements', warehouseId, type, pageNumber],
    queryFn: () =>
      stockMovementsApi.listStockMovements({
        pageNumber,
        pageSize: PAGE_SIZE,
        warehouseId: warehouseId || undefined,
        type: type ? (Number(type) as (typeof StockMovementType)[keyof typeof StockMovementType]) : undefined,
      }),
  });

  return (
    <div>
      <WarehouseTabs />
      <PageHeader title="История складских операций" />

      <div className={styles.toolbar}>
        <div className={styles.warehouseSelect}>
          <Select label="Склад" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">Все склады</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.warehouseSelect}>
          <Select label="Тип операции" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Все типы</option>
            {Object.entries(STOCK_MOVEMENT_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && (
        <EmptyState message="Операций пока нет." />
      )}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Дата</Th>
                <Th>Склад</Th>
                <Th>Товар</Th>
                <Th>Тип</Th>
                <Th>Кол-во</Th>
                <Th>Было → Стало</Th>
                <Th>Комментарий</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((m) => (
                <tr key={m.id}>
                  <Td className="font-data">{formatDateTime(m.createdAt)}</Td>
                  <Td>{m.warehouseName}</Td>
                  <Td>{m.productName}</Td>
                  <Td>
                    <Badge tone={STOCK_MOVEMENT_TYPE_TONE[m.type]}>{STOCK_MOVEMENT_TYPE_LABEL[m.type]}</Badge>
                  </Td>
                  <Td numeric>{m.quantity}</Td>
                  <Td numeric className="font-data">
                    {m.quantityBefore} → {m.quantityAfter}
                  </Td>
                  <Td>{m.note ?? '—'}</Td>
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
