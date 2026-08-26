import { z } from 'zod';
import { FinanceEntryKind } from '@/types/mocks';

// Нет реального backend-валидатора (зона на моках) — разумные ограничения для формы.
export const financeEntrySchema = z.object({
  kind: z.coerce.number().refine((v) => Object.values(FinanceEntryKind).includes(v as never)),
  date: z.string().min(1, 'Укажите дату'),
  amount: z.coerce.number().positive('Сумма должна быть больше нуля'),
  category: z.string().min(1, 'Выберите категорию'),
  accountId: z.string().min(1, 'Выберите счёт'),
  description: z.string().optional().or(z.literal('')),
});
export type FinanceEntryFormValues = z.infer<typeof financeEntrySchema>;
export type FinanceEntryFormInput = z.input<typeof financeEntrySchema>;
