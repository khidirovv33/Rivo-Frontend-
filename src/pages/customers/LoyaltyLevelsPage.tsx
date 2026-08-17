import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Table, Td, TextField, Th } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as loyaltyApi from '@/api/endpoints/loyalty';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import {
  loyaltyLevelSchema,
  type LoyaltyLevelFormInput,
  type LoyaltyLevelFormValues,
} from '@/lib/validation/customers';
import type { LoyaltyLevelDto } from '@/types/domain';
import { CustomerTabs } from './CustomerTabs';
import styles from '../_shared/CrudForm.module.css';

export function LoyaltyLevelsPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<LoyaltyLevelDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: levels, isLoading, isError, refetch } = useQuery({
    queryKey: ['loyalty-levels'],
    queryFn: loyaltyApi.listLoyaltyLevels,
  });

  const isOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: LoyaltyLevelFormValues) => {
      if (editing) {
        return loyaltyApi.updateLoyaltyLevel(editing.id, values);
      }
      return loyaltyApi.createLoyaltyLevel(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-levels'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => loyaltyApi.deleteLoyaltyLevel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loyalty-levels'] }),
  });

  function handleDelete(level: LoyaltyLevelDto) {
    if (window.confirm(`Удалить уровень «${level.name}»?`)) {
      deleteMutation.mutate(level.id);
    }
  }

  const canCreate = has('Loyalty.Create');
  const canUpdate = has('Loyalty.Update');
  const canDelete = has('Loyalty.Delete');

  return (
    <div>
      <CustomerTabs />
      <PageHeader
        title="Уровни лояльности"
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
      {!isLoading && !isError && levels && levels.length === 0 && <EmptyState message="Уровней пока нет." />}
      {!isLoading && !isError && levels && levels.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Мин. сумма покупок</Th>
              <Th>Скидка</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id}>
                <Td>{level.name}</Td>
                <Td numeric>{formatMoney(level.minimumSpend)}</Td>
                <Td numeric>{level.discountPercentage}%</Td>
                <Td>
                  <div className={styles.rowActions}>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(level)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(level)} aria-label="Удалить">
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

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить уровень' : 'Новый уровень'}>
        <LoyaltyLevelForm
          level={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}

function LoyaltyLevelForm({
  level,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  level: LoyaltyLevelDto | null;
  onSubmit: (values: LoyaltyLevelFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoyaltyLevelFormInput, unknown, LoyaltyLevelFormValues>({
    resolver: zodResolver(loyaltyLevelSchema),
    defaultValues: {
      name: level?.name ?? '',
      minimumSpend: level?.minimumSpend ?? 0,
      discountPercentage: level?.discountPercentage ?? 0,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField
        label="Минимальная сумма покупок"
        type="number"
        step="0.01"
        error={errors.minimumSpend?.message}
        {...register('minimumSpend')}
      />
      <TextField
        label="Скидка, %"
        type="number"
        step="0.01"
        error={errors.discountPercentage?.message}
        {...register('discountPercentage')}
      />
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
