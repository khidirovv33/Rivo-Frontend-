import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import { customerSchema, type CustomerFormValues } from '@/lib/validation/customers';
import type { CustomerDto } from '@/types/domain';
import styles from '../_shared/CrudForm.module.css';

interface CustomerFormProps {
  customer: CustomerDto | null;
  onSubmit: (values: CustomerFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function CustomerForm({ customer, onSubmit, onCancel, isSaving, serverError }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: customer?.fullName ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      birthDate: customer?.birthDate ?? '',
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Имя" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Телефон (необязательно)" error={errors.phone?.message} {...register('phone')} />
      <TextField label="Email (необязательно)" type="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Дата рождения (необязательно)" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
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
