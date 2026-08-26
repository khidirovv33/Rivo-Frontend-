import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import { supplierSchema, type SupplierFormInput, type SupplierFormValues } from '@/lib/validation/inventory';
import { SupplierStatus, type SupplierDto } from '@/types/domain';
import { SUPPLIER_STATUS_LABEL } from './labels';
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
  } = useForm<SupplierFormInput, unknown, SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      contactPerson: supplier?.contactPerson ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
      status: supplier?.status ?? SupplierStatus.Active,
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
      {supplier && (
        <Select label="Статус" error={errors.status?.message} {...register('status')}>
          {Object.entries(SUPPLIER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
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
