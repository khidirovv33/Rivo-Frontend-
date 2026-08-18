import { z } from 'zod';

// Правила зеркалят FluentValidation на бэкенде (Rivo.Application/Auth/Validators/*.cs):
// пароль — минимум 8 символов, хотя бы одна заглавная буква, хотя бы одна цифра.
const passwordSchema = z
  .string()
  .min(8, 'Минимум 8 символов')
  .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
  .regex(/[0-9]/, 'Должна быть хотя бы одна цифра');

export const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  companyName: z.string().min(1, 'Введите название компании').max(200, 'Максимум 200 символов'),
  fullName: z.string().min(1, 'Введите имя').max(200, 'Максимум 200 символов'),
  email: z.string().min(1, 'Введите email').email('Некорректный email').max(256),
  password: passwordSchema,
  phoneNumber: z.string().max(30, 'Максимум 30 символов').optional().or(z.literal('')),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  token: z.string().min(1, 'Токен обязателен'),
  newPassword: passwordSchema,
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
