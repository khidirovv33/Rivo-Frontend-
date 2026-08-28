import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { extractErrorMessage } from '@/api/client';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerCompany } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerCompany({ ...values, phoneNumber: values.phoneNumber || undefined });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <h2 className={styles.title}>{t('auth.register.title')}</h2>
      <p className={styles.subtitle}>{t('auth.register.subtitle')}</p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className={styles.error}>{serverError}</div>}
        <TextField label={t('auth.register.companyName')} error={errors.companyName?.message} {...register('companyName')} />
        <TextField label={t('auth.register.fullName')} error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label={t('auth.register.email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField label={t('auth.register.phone')} error={errors.phoneNumber?.message} {...register('phoneNumber')} />
        <TextField
          label={t('auth.register.password')}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>
      <div className={styles.footer}>
        {t('auth.register.haveAccount')} <Link className={styles.link} to="/login">{t('auth.register.loginLink')}</Link>
      </div>
    </div>
  );
}
