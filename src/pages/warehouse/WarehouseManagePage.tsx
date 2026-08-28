import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, TextField, Th } from '@/components';
import { EditIcon, PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { extractErrorMessage } from '@/api/client';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import type { WarehouseFormValues } from '@/lib/validation/inventory';
import type { WarehouseDto } from '@/types/domain';
import { WarehouseForm } from './WarehouseForm';
import { WarehouseTabs } from './WarehouseTabs';
import styles from './WarehousePage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function WarehouseManagePage() {
  const { has } = usePermissions();
  const { currentStore } = useStoreBranch();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<WarehouseDto | null>(null);
  const [creating, setCreating] = useState(false);

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
    queryKey: ['warehouses-page', pageNumber, searchTerm],
    queryFn: () => warehousesApi.listWarehouses({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  const isModalOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      if (editing) {
        return warehousesApi.updateWarehouse(editing.id, {
          name: values.name,
          address: values.address || undefined,
          isActive: values.isActive ?? true,
        });
      }
      return warehousesApi.createWarehouse({
        storeId: currentStore!.id,
        name: values.name,
        address: values.address || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses-page'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-all'] });
      closeModal();
    },
  });

  // Отдельного Warehouses.* права в каталоге нет — зона гейтится Inventory.Read/Create/Approve.
  const canCreate = has('Inventory.Create') && Boolean(currentStore);
  const canUpdate = has('Inventory.Create');

  return (
    <div>
      <WarehouseTabs />
      <PageHeader
        title="Склады"
        subtitle="Список складов компании"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить склад
            </Button>
          )
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Название склада…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Склады не найдены." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Название</Th>
                <Th>Адрес</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((warehouse) => (
                <tr key={warehouse.id}>
                  <Td>{warehouse.name}</Td>
                  <Td>{warehouse.address ?? '—'}</Td>
                  <Td>
                    <Badge tone={warehouse.isActive ? 'good' : 'neutral'}>
                      {warehouse.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </Td>
                  <Td>
                    {canUpdate && (
                      <div className={formStyles.rowActions}>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(warehouse)} aria-label="Изменить">
                          <EditIcon width={15} height={15} />
                        </Button>
                      </div>
                    )}
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

      <Modal open={isModalOpen} onClose={closeModal} title={editing ? 'Изменить склад' : 'Новый склад'}>
        <WarehouseForm
          warehouse={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
