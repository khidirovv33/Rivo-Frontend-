import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { extractErrorMessage } from '@/api/client';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <h2 className={styles.title}>{t('auth.login.title')}</h2>
      <p className={styles.subtitle}>{t('auth.login.subtitle')}</p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className={styles.error}>{serverError}</div>}
        <TextField
          label={t('auth.login.email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label={t('auth.login.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>
      <div className={styles.footer}>
        <Link className={styles.link} to="/forgot-password">
          {t('auth.login.forgotPassword')}
        </Link>
      </div>
      <div className={styles.footer}>
        {t('auth.login.noAccount')} <Link className={styles.link} to="/register">{t('auth.login.registerLink')}</Link>
      </div>
    </div>
  );
}
