import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { useAuth } from '@/auth/useAuth';
import { extractErrorMessage } from '@/api/client';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import styles from './AuthForm.module.css';

export function RegisterPage() {
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
      <h2 className={styles.title}>Регистрация компании</h2>
      <p className={styles.subtitle}>Создайте аккаунт владельца и начните работу с Rivo</p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className={styles.error}>{serverError}</div>}
        <TextField label="Название компании" error={errors.companyName?.message} {...register('companyName')} />
        <TextField label="Ваше имя" error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField label="Телефон (необязательно)" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
        <TextField
          label="Пароль"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Создаём…' : 'Зарегистрироваться'}
        </Button>
      </form>
      <div className={styles.footer}>
        Уже есть аккаунт? <Link className={styles.link} to="/login">Войти</Link>
      </div>
    </div>
  );
}
