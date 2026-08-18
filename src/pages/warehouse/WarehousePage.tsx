import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loader, PageHeader, Pagination, Select, Table, Td, TextField, Th } from '@/components';
import * as stockApi from '@/api/endpoints/stock';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePage.module.css';

const PAGE_SIZE = 20;

export function WarehousePage() {
  const { currentBranch } = useStoreBranch();

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
    queryKey: ['stock', warehouseId, pageNumber, searchTerm],
    queryFn: () =>
      stockApi.listStock({
        pageNumber,
        pageSize: PAGE_SIZE,
        searchTerm: searchTerm || undefined,
        warehouseId: warehouseId || undefined,
      }),
  });

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
                  <Td className="font-data">{stock.productSku}</Td>
                  <Td>{stock.productName}</Td>
                  <Td>{stock.warehouseName}</Td>
                  <Td numeric>{stock.quantity}</Td>
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
