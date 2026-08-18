import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Table, Td, TextField, Th } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as brandsApi from '@/api/endpoints/brands';
import { extractErrorMessage } from '@/api/client';
import { brandSchema, type BrandFormValues } from '@/lib/validation/catalog';
import type { BrandDto } from '@/types/domain';
import { CatalogTabs } from './CatalogTabs';
import styles from '../_shared/CrudForm.module.css';

export function BrandsPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<BrandDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: brands, isLoading, isError, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: brandsApi.listBrands,
  });

  const isOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: BrandFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
      };
      if (editing) {
        return brandsApi.updateBrand(editing.id, payload);
      }
      return brandsApi.createBrand(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsApi.deleteBrand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  function handleDelete(brand: BrandDto) {
    if (window.confirm(`Удалить бренд «${brand.name}»?`)) {
      deleteMutation.mutate(brand.id);
    }
  }

  const canCreate = has('Brands.Create');
  const canUpdate = has('Brands.Update');
  const canDelete = has('Brands.Delete');

  return (
    <div>
      <CatalogTabs />
      <PageHeader
        title="Бренды"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && brands && brands.length === 0 && <EmptyState message="Брендов пока нет." />}
      {!isLoading && !isError && brands && brands.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Описание</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id}>
                <Td>{brand.name}</Td>
                <Td>{brand.description ?? '—'}</Td>
                <Td>
                  <div className={styles.rowActions}>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(brand)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)} aria-label="Удалить">
                        <TrashIcon width={15} height={15} />
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить бренд' : 'Новый бренд'}>
        <BrandForm
          brand={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}

function BrandForm({
  brand,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  brand: BrandDto | null;
  onSubmit: (values: BrandFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name ?? '',
      description: brand?.description ?? '',
      logoUrl: brand?.logoUrl ?? '',
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Описание (необязательно)" error={errors.description?.message} {...register('description')} />
      <TextField label="Ссылка на логотип (необязательно)" error={errors.logoUrl?.message} {...register('logoUrl')} />
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
