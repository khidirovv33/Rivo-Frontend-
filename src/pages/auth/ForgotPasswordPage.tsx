import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { forgotPassword } from '@/api/endpoints/auth';
import { extractErrorMessage } from '@/api/client';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <h2 className={styles.title}>{t('auth.forgotPassword.title')}</h2>
      <p className={styles.subtitle}>{t('auth.forgotPassword.subtitle')}</p>
      {sent ? (
        <div className={styles.success}>{t('auth.forgotPassword.success')}</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className={styles.error}>{serverError}</div>}
          <TextField
            label={t('auth.forgotPassword.email')}
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
          </Button>
        </form>
      )}
      <div className={styles.footer}>
        <Link className={styles.link} to="/login">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
