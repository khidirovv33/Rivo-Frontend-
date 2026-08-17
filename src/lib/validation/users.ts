import { z } from 'zod';
import { UserStatus } from '@/types/domain';

// Правила зеркалят Rivo.Application/Users/Validators/UserDtoValidators.cs

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Введите имя').max(200, 'Максимум 200 символов'),
  email: z.string().min(1, 'Введите email').email('Некорректный email').max(256),
  password: z.string().min(8, 'Минимум 8 символов'),
  phoneNumber: z.string().optional().or(z.literal('')),
  roleId: z.string().min(1, 'Выберите роль'),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Введите имя').max(200, 'Максимум 200 символов'),
  phoneNumber: z.string().optional().or(z.literal('')),
  roleId: z.string().min(1, 'Выберите роль'),
  status: z.coerce.number().refine((v) => Object.values(UserStatus).includes(v as never), {
    message: 'Некорректный статус',
  }),
});
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UpdateUserFormInput = z.input<typeof updateUserSchema>;

export const ownProfileSchema = z.object({
  fullName: z.string().min(1, 'Введите имя').max(200, 'Максимум 200 символов'),
  phoneNumber: z.string().optional().or(z.literal('')),
});
export type OwnProfileFormValues = z.infer<typeof ownProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
      .string()
      .min(8, 'Минимум 8 символов')
      .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
      .regex(/[0-9]/, 'Должна быть хотя бы одна цифра'),
    confirmPassword: z.string().min(1, 'Повторите новый пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
