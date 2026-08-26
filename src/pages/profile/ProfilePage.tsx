import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Modal, PageHeader, TextField } from '@/components';
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  return (
    <div>
      <PageHeader title="Профиль" />
      <div className={styles.grid}>
        <Card>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Личные данные</h2>
            <Button variant="secondary" size="sm" onClick={() => setEditingProfile(true)}>
              Изменить
            </Button>
          </div>
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{user?.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Имя</span>
              <span className={styles.detailValue}>{user?.fullName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Телефон</span>
              <span className={styles.detailValue}>{user?.phoneNumber || '—'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Пароль</h2>
            <Button variant="secondary" size="sm" onClick={() => setEditingPassword(true)}>
              Изменить
            </Button>
          </div>
          <p className={styles.hint}>Пароль скрыт. Чтобы задать новый, нажмите «Изменить».</p>
        </Card>
      </div>

      <Modal open={editingProfile} onClose={() => setEditingProfile(false)} title="Личные данные">
        <ProfileForm
          fullName={user?.fullName ?? ''}
          phoneNumber={user?.phoneNumber ?? ''}
          email={user?.email ?? ''}
          onSaved={async () => {
            await refreshCurrentUser();
            setEditingProfile(false);
          }}
        />
      </Modal>

      <Modal open={editingPassword} onClose={() => setEditingPassword(false)} title="Смена пароля">
        <PasswordForm onSaved={() => setEditingPassword(false)} />
      </Modal>
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

function PasswordForm({ onSaved }: { onSaved: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => onSaved(),
  });

  return (
    <form className={formStyles.form} onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      {mutation.isError && <div className={formStyles.error}>{extractErrorMessage(mutation.error)}</div>}
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
