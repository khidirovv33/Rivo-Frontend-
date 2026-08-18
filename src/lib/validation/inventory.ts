import { z } from 'zod';
import { SupplierStatus } from '@/types/domain';

// Точные бэкенд-ограничения (MaxLength и т.п.) не выгружены в этот репозиторий — см. заметку
// в README о сверке с Rivo.Application/{Warehouses,Suppliers,Purchases,Transfers}/Validators/*.cs.
// Здесь — разумные дефолты в духе остальных форм проекта.

export const supplierSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  contactPerson: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  status: z.coerce.number().refine((v) => Object.values(SupplierStatus).includes(v as never), {
    message: 'Некорректный статус',
  }),
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
    fromWarehouseId: z.string().min(1, 'Выберите склад-отправитель'),
    toWarehouseId: z.string().min(1, 'Выберите склад-получатель'),
  })
  .refine((v) => v.fromWarehouseId !== v.toWarehouseId, {
    message: 'Склады отправителя и получателя должны отличаться',
    path: ['toWarehouseId'],
  });
export type TransferHeaderValues = z.infer<typeof transferHeaderSchema>;
