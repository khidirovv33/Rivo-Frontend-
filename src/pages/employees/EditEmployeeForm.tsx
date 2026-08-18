import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import * as rolesApi from '@/api/endpoints/roles';
import { updateUserSchema, type UpdateUserFormInput, type UpdateUserFormValues } from '@/lib/validation/users';
import type { UserDto } from '@/types/domain';
import { USER_STATUS_LABEL } from './labels';
import styles from '../_shared/CrudForm.module.css';

interface EditEmployeeFormProps {
  user: UserDto;
  onSubmit: (values: UpdateUserFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function EditEmployeeForm({ user, onSubmit, onCancel, isSaving, serverError }: EditEmployeeFormProps) {
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.listRoles });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserFormInput, unknown, UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber ?? '',
      roleId: user.roleId,
      status: user.status,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Имя" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Телефон (необязательно)" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      <Select label="Роль" error={errors.roleId?.message} {...register('roleId')}>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>
      <Select label="Статус" error={errors.status?.message} {...register('status')}>
        {Object.entries(USER_STATUS_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
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
