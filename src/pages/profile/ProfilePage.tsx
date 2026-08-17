import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, PageHeader, TextField } from '@/components';
import { useAuth } from '@/auth/useAuth';
import * as usersApi from '@/api/endpoints/users';
import * as authApi from '@/api/endpoints/auth';
import { extractErrorMessage } from '@/api/client';
import {
  changePasswordSchema,
  ownProfileSchema,
  type ChangePasswordFormValues,
  type OwnProfileFormValues,
} from '@/lib/validation/users';
import styles from './ProfilePage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function ProfilePage() {
  const { user, refreshCurrentUser } = useAuth();

  return (
    <div>
      <PageHeader title="Профиль" />
      <div className={styles.grid}>
        <Card>
          <h2 className={styles.cardTitle}>Личные данные</h2>
          <ProfileForm fullName={user?.fullName ?? ''} phoneNumber={user?.phoneNumber ?? ''} email={user?.email ?? ''} onSaved={refreshCurrentUser} />
        </Card>
        <Card>
          <h2 className={styles.cardTitle}>Смена пароля</h2>
          <PasswordForm />
        </Card>
      </div>
    </div>
  );
}

function ProfileForm({
  fullName,
  phoneNumber,
  email,
  onSaved,
}: {
  fullName: string;
  phoneNumber: string;
  email: string;
  onSaved: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnProfileFormValues>({
    resolver: zodResolver(ownProfileSchema),
    defaultValues: { fullName, phoneNumber },
  });

  const mutation = useMutation({
    mutationFn: (values: OwnProfileFormValues) =>
      usersApi.updateMe({ fullName: values.fullName, phoneNumber: values.phoneNumber || undefined }),
    onSuccess: () => onSaved(),
  });

  return (
    <form className={formStyles.form} onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      {mutation.isError && <div className={formStyles.error}>{extractErrorMessage(mutation.error)}</div>}
      {mutation.isSuccess && <div className={styles.success}>Сохранено.</div>}
      <TextField label="Email" value={email} disabled />
      <TextField label="Имя" error={errors.fullName?.message} {...register('fullName')} />
      <TextField label="Телефон (необязательно)" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      <div className={formStyles.formActions}>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      setSuccess(true);
      reset();
    },
  });

  return (
    <form
      className={formStyles.form}
      onSubmit={handleSubmit((values) => {
        setSuccess(false);
        mutation.mutate(values);
      })}
      noValidate
    >
      {mutation.isError && <div className={formStyles.error}>{extractErrorMessage(mutation.error)}</div>}
      {success && <div className={styles.success}>Пароль изменён.</div>}
      <TextField
        label="Текущий пароль"
        type="password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <TextField
        label="Новый пароль"
        type="password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <TextField
        label="Повторите новый пароль"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <div className={formStyles.formActions}>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Меняем…' : 'Изменить пароль'}
        </Button>
      </div>
    </form>
  );
}
