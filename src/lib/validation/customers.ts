import { z } from 'zod';

// Правила зеркалят Rivo.Application/{Customers,Loyalty}/Validators/*.cs

export const customerSchema = z.object({
  fullName: z.string().min(1, 'Введите имя').max(200, 'Максимум 200 символов'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;

export const loyaltyLevelSchema = z.object({
  name: z.string().min(1, 'Введите название').max(100, 'Максимум 100 символов'),
  minimumSpend: z.coerce.number().min(0, 'Не может быть отрицательной'),
  discountPercentage: z.coerce.number().min(0, 'От 0 до 100').max(100, 'От 0 до 100'),
});
export type LoyaltyLevelFormValues = z.infer<typeof loyaltyLevelSchema>;
export type LoyaltyLevelFormInput = z.input<typeof loyaltyLevelSchema>;
