import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import { storeSchema, type StoreFormInput, type StoreFormValues } from '@/lib/validation/stores';
import { StoreStatus, type StoreDto } from '@/types/domain';
import { STORE_STATUS_LABEL } from './labels';
import styles from '../_shared/CrudForm.module.css';

interface StoreFormProps {
  store: StoreDto | null;
  onSubmit: (values: StoreFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function StoreForm({ store, onSubmit, onCancel, isSaving, serverError }: StoreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormInput, unknown, StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name ?? '',
      logoUrl: store?.logoUrl ?? '',
      address: store?.address ?? '',
      phone: store?.phone ?? '',
      email: store?.email ?? '',
      currency: store?.currency ?? 'TJS',
      defaultTaxRate: store?.defaultTaxRate ?? 0,
      openingHours: store?.openingHours ?? '',
      status: store?.status ?? StoreStatus.Active,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />
      <TextField label="Телефон (необязательно)" error={errors.phone?.message} {...register('phone')} />
      <TextField label="Email (необязательно)" type="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Валюта (код из 3 букв)" error={errors.currency?.message} {...register('currency')} />
      <TextField
        label="Ставка налога по умолчанию, %"
        type="number"
        step="0.01"
        error={errors.defaultTaxRate?.message}
        {...register('defaultTaxRate')}
      />
      <TextField
        label="Часы работы (необязательно)"
        error={errors.openingHours?.message}
        {...register('openingHours')}
      />
      <TextField label="Ссылка на логотип (необязательно)" error={errors.logoUrl?.message} {...register('logoUrl')} />

      {store && (
        <Select label="Статус" error={errors.status?.message} {...register('status')}>
          {Object.entries(STORE_STATUS_LABEL).map(([value, label]) => (
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
