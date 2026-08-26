import { z } from 'zod';
import { StoreStatus } from '@/types/domain';

// Правила зеркалят Rivo.Application/Stores/Validators/StoreDtoValidators.cs

export const storeSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  logoUrl: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  currency: z.string().length(3, 'Код валюты — 3 символа (например, TJS)'),
  defaultTaxRate: z.coerce.number().min(0, 'Не может быть отрицательной'),
  openingHours: z.string().optional().or(z.literal('')),
  status: z.coerce.number().refine((v) => Object.values(StoreStatus).includes(v as never), {
    message: 'Некорректный статус',
  }),
});
export type StoreFormValues = z.infer<typeof storeSchema>;
export type StoreFormInput = z.input<typeof storeSchema>;

export const branchSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.coerce.number().refine((v) => Object.values(StoreStatus).includes(v as never), {
    message: 'Некорректный статус',
  }),
});
export type BranchFormValues = z.infer<typeof branchSchema>;
export type BranchFormInput = z.input<typeof branchSchema>;
