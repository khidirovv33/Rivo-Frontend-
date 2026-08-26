import { z } from 'zod';

// Точные бэкенд-ограничения (MaxLength и т.п.) не выгружены в этот репозиторий — только форма
// DTO сверена по Swagger запущенного бэкенда (SupplierDto.isActive — boolean, не enum-статус).
// Здесь — разумные дефолты в духе остальных форм проекта.

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Введите название').max(150, 'Максимум 150 символов'),
  address: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export const supplierSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  contactPerson: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;
export type SupplierFormInput = z.input<typeof supplierSchema>;

// Позиции (items) заказа/перемещения — отдельный список в UI (см. ProductPicker), не поле формы:
// react-hook-form здесь валидирует только "шапку", количество/пустой список проверяются на submit.

export const purchaseOrderHeaderSchema = z.object({
  supplierId: z.string().min(1, 'Выберите поставщика'),
  warehouseId: z.string().min(1, 'Выберите склад'),
  expectedDate: z.string().optional().or(z.literal('')),
});
export type PurchaseOrderHeaderValues = z.infer<typeof purchaseOrderHeaderSchema>;

export const transferHeaderSchema = z
  .object({
    sourceWarehouseId: z.string().min(1, 'Выберите склад-отправитель'),
    destinationWarehouseId: z.string().min(1, 'Выберите склад-получатель'),
  })
  .refine((v) => v.sourceWarehouseId !== v.destinationWarehouseId, {
    message: 'Склады отправителя и получателя должны отличаться',
    path: ['destinationWarehouseId'],
  });
export type TransferHeaderValues = z.infer<typeof transferHeaderSchema>;

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Сумма должна быть больше нуля'),
  notes: z.string().optional().or(z.literal('')),
});
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
export type RecordPaymentFormInput = z.input<typeof recordPaymentSchema>;
