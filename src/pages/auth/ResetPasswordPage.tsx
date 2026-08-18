import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { resetPassword } from '@/api/endpoints/auth';
import { extractErrorMessage } from '@/api/client';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      token: searchParams.get('token') ?? '',
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null);
    try {
      await resetPassword(values);
      setDone(true);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <h2 className={styles.title}>Новый пароль</h2>
      <p className={styles.subtitle}>Введите email, код из письма и новый пароль</p>
      {done ? (
        <div className={styles.success}>Пароль изменён. Теперь можно войти с новым паролем.</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className={styles.error}>{serverError}</div>}
          <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <TextField label="Код из письма" error={errors.token?.message} {...register('token')} />
          <TextField
            label="Новый пароль"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем…' : 'Сохранить пароль'}
          </Button>
        </form>
      )}
      {done && (
        <Button variant="primary" className={styles.submit} onClick={() => navigate('/login')}>
          К странице входа
        </Button>
      )}
      <div className={styles.footer}>
        <Link className={styles.link} to="/login">
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}
