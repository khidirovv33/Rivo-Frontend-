import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import { branchSchema, type BranchFormInput, type BranchFormValues } from '@/lib/validation/stores';
import { StoreStatus, type BranchDto } from '@/types/domain';
import { STORE_STATUS_LABEL } from './labels';
import styles from '../_shared/CrudForm.module.css';

interface BranchFormProps {
  branch: BranchDto | null;
  onSubmit: (values: BranchFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function BranchForm({ branch, onSubmit, onCancel, isSaving, serverError }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormInput, unknown, BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch?.name ?? '',
      address: branch?.address ?? '',
      phone: branch?.phone ?? '',
      status: branch?.status ?? StoreStatus.Active,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название филиала" error={errors.name?.message} {...register('name')} />
      <TextField label="Адрес (необязательно)" error={errors.address?.message} {...register('address')} />
      <TextField label="Телефон (необязательно)" error={errors.phone?.message} {...register('phone')} />

      {branch && (
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
