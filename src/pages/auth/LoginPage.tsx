import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { extractErrorMessage } from '@/api/client';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function LoginPage() {
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
      <h2 className={styles.title}>Вход</h2>
      <p className={styles.subtitle}>Войдите, чтобы продолжить работу</p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className={styles.error}>{serverError}</div>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Пароль"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <div className={styles.footer}>
        <Link className={styles.link} to="/forgot-password">
          Забыли пароль?
        </Link>
      </div>
      <div className={styles.footer}>
        Нет компании? <Link className={styles.link} to="/register">Зарегистрировать</Link>
      </div>
    </div>
  );
}
