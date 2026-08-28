import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import { warehouseSchema, type WarehouseFormValues } from '@/lib/validation/inventory';
import type { WarehouseDto } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface WarehouseFormProps {
  warehouse: WarehouseDto | null;
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function WarehouseForm({ warehouse, onSubmit, onCancel, isSaving, serverError }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name ?? '',
      address: warehouse?.address ?? '',
      isActive: warehouse?.isActive ?? true,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />
      {warehouse && (
        <label className={styles.checkboxRow}>
          <input type="checkbox" {...register('isActive')} />
          Активен
        </label>
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
