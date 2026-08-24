import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import * as stockMovementsApi from '@/api/endpoints/stockMovements';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { formatDateTime } from '@/lib/format';
import { useProductLookup } from '../_shared/useProductLookup';
import { STOCK_MOVEMENT_TYPE_LABEL, STOCK_MOVEMENT_TYPE_TONE } from './labels';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePage.module.css';

const PAGE_SIZE = 20;

export function WarehouseMovementsPage() {
  const { currentStore } = useStoreBranch();

  const [pageNumber, setPageNumber] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setPageNumber(1);
  }, [warehouseId]);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', currentStore?.id],
    queryFn: () => warehousesApi.listAllWarehouses(currentStore!.id),
    enabled: Boolean(currentStore),
  });
  const warehouseNameById = useMemo(() => new Map(warehouses.map((w) => [w.id, w.name])), [warehouses]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stock-movements', warehouseId, pageNumber],
    queryFn: () =>
      stockMovementsApi.listStockMovements({
        pageNumber,
        pageSize: PAGE_SIZE,
        warehouseId: warehouseId || undefined,
      }),
  });

  // GET /api/stock-movements не поддерживает фильтр по типу на бэкенде — фильтруем только
  // внутри уже загруженной страницы (пагинация/totalCount при этом считаются без фильтра).
  const visibleItems = (page?.items ?? []).filter((m) => !type || String(m.type) === type);

  const { getName } = useProductLookup(visibleItems.map((m) => m.productId));

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
          <Select label="Тип операции (на этой странице)" value={type} onChange={(e) => setType(e.target.value)}>
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
      {!isLoading && !isError && visibleItems.length === 0 && <EmptyState message="Операций пока нет." />}

      {!isLoading && !isError && page && visibleItems.length > 0 && (
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
              {visibleItems.map((m) => (
                <tr key={m.id}>
                  <Td className="font-data">{formatDateTime(m.createdAt)}</Td>
                  <Td>{warehouseNameById.get(m.warehouseId) ?? '—'}</Td>
                  <Td>{getName(m.productId)}</Td>
                  <Td>
                    <Badge tone={STOCK_MOVEMENT_TYPE_TONE[m.type]}>{STOCK_MOVEMENT_TYPE_LABEL[m.type]}</Badge>
                  </Td>
                  <Td numeric>{m.quantity}</Td>
                  <Td numeric className="font-data">
                    {m.quantityBefore} → {m.quantityAfter}
                  </Td>
                  <Td>{m.reason ?? '—'}</Td>
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
