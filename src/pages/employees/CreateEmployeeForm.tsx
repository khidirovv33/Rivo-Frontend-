import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import * as rolesApi from '@/api/endpoints/roles';
import { createUserSchema, type CreateUserFormValues } from '@/lib/validation/users';
import styles from '../_shared/CrudForm.module.css';

interface CreateEmployeeFormProps {
  onSubmit: (values: CreateUserFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function CreateEmployeeForm({ onSubmit, onCancel, isSaving, serverError }: CreateEmployeeFormProps) {
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.listRoles });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: '', email: '', password: '', phoneNumber: '', roleId: '' },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Имя" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Пароль" type="password" error={errors.password?.message} {...register('password')} />
      <TextField label="Телефон (необязательно)" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      <Select label="Роль" error={errors.roleId?.message} {...register('roleId')}>
        <option value="">Выберите роль</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>
      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Создаём…' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
