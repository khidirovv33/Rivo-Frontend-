import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Select, Table, Td, TextField, Th } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as suppliersApi from '@/api/endpoints/suppliers';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import { supplierSchema, type SupplierFormValues } from '@/lib/validation/warehouse';
import type { SupplierDto } from '@/types/domain';
import { PurchasesTabs } from './PurchasesTabs';
import styles from '../_shared/CrudForm.module.css';

export function SuppliersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SupplierDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: suppliers, isLoading, isError, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.listSuppliers({ pageNumber: 1, pageSize: 100 }),
  });

  const isOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      const payload = {
        name: values.name,
        contactPerson: values.contactPerson || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      };
      if (editing) {
        return suppliersApi.updateSupplier(editing.id, { ...payload, isActive: values.isActive === 'true' });
      }
      return suppliersApi.createSupplier(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-lookup'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-lookup'] });
    },
  });

  function handleDelete(supplier: SupplierDto) {
    if (window.confirm(`Удалить поставщика «${supplier.name}»?`)) {
      deleteMutation.mutate(supplier.id);
    }
  }

  const canManage = has('Inventory.Create');
  const items = suppliers?.items ?? [];

  return (
    <div>
      <PurchasesTabs />
      <PageHeader
        title="Поставщики"
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
      {!isLoading && !isError && items.length === 0 && <EmptyState message="Поставщиков пока нет." />}

      {!isLoading && !isError && items.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Контакт</Th>
              <Th>Телефон</Th>
              <Th>Долг</Th>
              <Th>Статус</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {items.map((supplier) => (
              <tr key={supplier.id}>
                <Td>{supplier.name}</Td>
                <Td>{supplier.contactPerson ?? '—'}</Td>
                <Td className="font-data">{supplier.phone ?? '—'}</Td>
                <Td numeric className="font-data">{formatMoney(supplier.outstandingDebt)}</Td>
                <Td>
                  <Badge tone={supplier.isActive ? 'good' : 'neutral'}>
                    {supplier.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </Td>
                <Td>
                  {canManage && (
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(supplier)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier)} aria-label="Удалить">
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

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить поставщика' : 'Новый поставщик'}>
        <SupplierForm
          supplier={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}

function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  supplier: SupplierDto | null;
  onSubmit: (values: SupplierFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      contactPerson: supplier?.contactPerson ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
      notes: supplier?.notes ?? '',
      isActive: (supplier?.isActive ?? true) ? 'true' : 'false',
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Контактное лицо (необязательно)" error={errors.contactPerson?.message} {...register('contactPerson')} />
      <TextField label="Телефон (необязательно)" error={errors.phone?.message} {...register('phone')} />
      <TextField label="Email (необязательно)" error={errors.email?.message} {...register('email')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />
      <TextField label="Заметки (необязательно)" error={errors.notes?.message} {...register('notes')} />
      {supplier && (
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
