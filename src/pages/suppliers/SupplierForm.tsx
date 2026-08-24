import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import { supplierSchema, type SupplierFormValues } from '@/lib/validation/inventory';
import type { SupplierDto } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface SupplierFormProps {
  supplier: SupplierDto | null;
  onSubmit: (values: SupplierFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function SupplierForm({ supplier, onSubmit, onCancel, isSaving, serverError }: SupplierFormProps) {
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
      isActive: supplier?.isActive ?? true,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Контактное лицо (необязательно)" error={errors.contactPerson?.message} {...register('contactPerson')} />
      <TextField label="Телефон (необязательно)" error={errors.phone?.message} {...register('phone')} />
      <TextField label="Email (необязательно)" type="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />
      <TextField label="Заметки (необязательно)" error={errors.notes?.message} {...register('notes')} />
      {supplier && (
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
