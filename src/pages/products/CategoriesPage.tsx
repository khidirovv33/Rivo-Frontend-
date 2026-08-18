import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Select, Table, Td, TextField, Th } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as categoriesApi from '@/api/endpoints/categories';
import { extractErrorMessage } from '@/api/client';
import { categorySchema, type CategoryFormValues } from '@/lib/validation/catalog';
import type { CategoryDto } from '@/types/domain';
import { CatalogTabs } from './CatalogTabs';
import styles from '../_shared/CrudForm.module.css';

export function CategoriesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.listCategories,
  });

  const isOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        parentCategoryId: values.parentCategoryId || undefined,
      };
      if (editing) {
        return categoriesApi.updateCategory(editing.id, payload);
      }
      return categoriesApi.createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  function handleDelete(category: CategoryDto) {
    if (window.confirm(`Удалить категорию «${category.name}»?`)) {
      deleteMutation.mutate(category.id);
    }
  }

  const canCreate = has('Categories.Create');
  const canUpdate = has('Categories.Update');
  const canDelete = has('Categories.Delete');

  return (
    <div>
      <CatalogTabs />
      <PageHeader
        title="Категории"
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
      {!isLoading && !isError && categories && categories.length === 0 && (
        <EmptyState message="Категорий пока нет." />
      )}
      {!isLoading && !isError && categories && categories.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Родительская категория</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <Td>{category.name}</Td>
                <Td>{categories.find((c) => c.id === category.parentCategoryId)?.name ?? '—'}</Td>
                <Td>
                  <div className={styles.rowActions}>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(category)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category)} aria-label="Удалить">
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

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить категорию' : 'Новая категория'}>
        <CategoryForm
          category={editing}
          categories={categories ?? []}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({
  category,
  categories,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  category: CategoryDto | null;
  categories: CategoryDto[];
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      parentCategoryId: category?.parentCategoryId ?? '',
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Описание (необязательно)" error={errors.description?.message} {...register('description')} />
      <Select label="Родительская категория (необязательно)" {...register('parentCategoryId')}>
        <option value="">Нет</option>
        {categories
          .filter((c) => c.id !== category?.id)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </Select>
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
