import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, TextField, Th } from '@/components';
import * as stockApi from '@/api/endpoints/stock';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { useProductLookup } from '../_shared/useProductLookup';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePage.module.css';

const PAGE_SIZE = 20;

export function WarehousePage() {
  const { currentStore } = useStoreBranch();

  const [pageNumber, setPageNumber] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
    queryKey: ['stock', warehouseId, pageNumber, searchTerm],
    queryFn: () =>
      stockApi.listStock({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: searchTerm || undefined,
        warehouseId: warehouseId || undefined,
      }),
  });

  const { getName, getSku } = useProductLookup((page?.items ?? []).map((s) => s.productId));

  return (
    <div>
      <WarehouseTabs />
      <PageHeader title="Склад" subtitle="Остатки по товарам: системный запас, резерв и доступно к продаже" />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Название или SKU товара…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className={styles.warehouseSelect}>
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
      {!isLoading && !isError && page && page.items.length === 0 && (
        <EmptyState message="Остатки не найдены." />
      )}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>SKU</Th>
                <Th>Товар</Th>
                <Th>Склад</Th>
                <Th>Системный запас</Th>
                <Th>Резерв</Th>
                <Th>Доступно</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((stock) => (
                <tr key={stock.id}>
                  <Td className="font-data">{getSku(stock.productId)}</Td>
                  <Td>{getName(stock.productId)}</Td>
                  <Td>{warehouseNameById.get(stock.warehouseId) ?? '—'}</Td>
                  <Td numeric>{stock.systemQuantity}</Td>
                  <Td numeric>{stock.reservedQuantity}</Td>
                  <Td numeric className={stock.availableQuantity <= 0 ? styles.lowStock : undefined}>
                    {stock.availableQuantity}
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
    </div>
  );
}
