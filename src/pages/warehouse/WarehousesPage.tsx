import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Loader,
  Modal,
  PageHeader,
  Select,
  Table,
  Td,
  TextField,
  Th,
} from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { listStores } from '@/api/endpoints/stores';
import { extractErrorMessage } from '@/api/client';
import { warehouseSchema, type WarehouseFormValues } from '@/lib/validation/warehouse';
import type { WarehouseDto } from '@/types/domain';
import { WarehouseTabs } from './WarehouseTabs';
import styles from '../_shared/CrudForm.module.css';

export function WarehousesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<WarehouseDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: warehouses, isLoading, isError, refetch } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.listWarehouses({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: listStores });

  const isOpen = creating || editing !== null;

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
          isActive: values.isActive === 'true',
        });
      }
      return warehousesApi.createWarehouse({
        storeId: values.storeId,
        branchId: values.branchId || undefined,
        name: values.name,
        address: values.address || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-lookup'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesApi.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-lookup'] });
    },
  });

  function handleDelete(warehouse: WarehouseDto) {
    if (window.confirm(`Удалить склад «${warehouse.name}»?`)) {
      deleteMutation.mutate(warehouse.id);
    }
  }

  const canManage = has('Inventory.Create');
  const items = warehouses?.items ?? [];

  return (
    <div>
      <WarehouseTabs />
      <PageHeader
        title="Склады"
        actions={
          canManage && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState message="Складов пока нет." />}

      {!isLoading && !isError && items.length > 0 && (
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
            {items.map((warehouse) => (
              <tr key={warehouse.id}>
                <Td>{warehouse.name}</Td>
                <Td>{warehouse.address ?? '—'}</Td>
                <Td>
                  <Badge tone={warehouse.isActive ? 'good' : 'neutral'}>
                    {warehouse.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </Td>
                <Td>
                  {canManage && (
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(warehouse)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(warehouse)} aria-label="Удалить">
                        <TrashIcon width={15} height={15} />
                      </Button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить склад' : 'Новый склад'}>
        <WarehouseForm
          warehouse={editing}
          stores={stores ?? []}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}

function WarehouseForm({
  warehouse,
  stores,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  warehouse: WarehouseDto | null;
  stores: { id: string; name: string; branches: { id: string; name: string }[] }[];
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      storeId: warehouse?.storeId ?? stores[0]?.id ?? '',
      branchId: warehouse?.branchId ?? '',
      name: warehouse?.name ?? '',
      address: warehouse?.address ?? '',
      isActive: (warehouse?.isActive ?? true) ? 'true' : 'false',
    },
  });

  const selectedStoreId = watch('storeId');
  const branches = stores.find((s) => s.id === selectedStoreId)?.branches ?? [];

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}

      {!warehouse && (
        <>
          <Select label="Магазин" error={errors.storeId?.message} {...register('storeId')}>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
          <Select label="Филиал (необязательно)" error={errors.branchId?.message} {...register('branchId')}>
            <option value="">— Весь магазин —</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </>
      )}

      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />

      {warehouse && (
        <Select label="Статус" error={errors.isActive?.message} {...register('isActive')}>
          <option value="true">Активен</option>
          <option value="false">Неактивен</option>
        </Select>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}
