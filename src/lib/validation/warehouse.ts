import { z } from 'zod';

export const warehouseSchema = z.object({
  storeId: z.string().min(1, 'Выберите магазин'),
  branchId: z.string().optional().or(z.literal('')),
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  address: z.string().optional().or(z.literal('')),
  isActive: z.enum(['true', 'false']),
});
export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export const supplierSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  contactPerson: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  isActive: z.enum(['true', 'false']),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;
