import { z } from 'zod';
import { ProductStatus } from '@/types/domain';

// Правила зеркалят Rivo.Application/{Products,Categories,Brands}/Validators/*.cs

export const categorySchema = z.object({
  name: z.string().min(1, 'Введите название').max(150, 'Максимум 150 символов'),
  description: z.string().optional().or(z.literal('')),
  parentCategoryId: z.string().optional().or(z.literal('')),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(1, 'Введите название').max(150, 'Максимум 150 символов'),
  description: z.string().optional().or(z.literal('')),
  logoUrl: z.string().optional().or(z.literal('')),
});
export type BrandFormValues = z.infer<typeof brandSchema>;

export const productSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  sku: z.string().min(1, 'Введите SKU').max(100, 'Максимум 100 символов'),
  barcode: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  brandId: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  purchasePrice: z.coerce.number().min(0, 'Не может быть отрицательной'),
  sellingPrice: z.coerce.number().min(0, 'Не может быть отрицательной'),
  wholesalePrice: z.coerce.number().min(0, 'Не может быть отрицательной').optional(),
  minimumPrice: z.coerce.number().min(0, 'Не может быть отрицательной').optional(),
  unit: z.string().min(1, 'Укажите единицу измерения'),
  minimumStock: z.coerce.number().int('Целое число').min(0, 'Не может быть отрицательным'),
  maximumStock: z.coerce.number().int('Целое число').min(0, 'Не может быть отрицательным').optional(),
  taxRate: z.coerce.number().min(0, 'От 0 до 100').max(100, 'От 0 до 100'),
  status: z.coerce.number().refine((v) => Object.values(ProductStatus).includes(v as never), {
    message: 'Некорректный статус',
  }),
});
export type ProductFormValues = z.infer<typeof productSchema>;
// Форма содержит поля с z.coerce (числа приходят из <input> как строки) — react-hook-form
// должен работать с "сырым" (input) типом, а результат onSubmit — с распарсенным (output).
export type ProductFormInput = z.input<typeof productSchema>;

export const productVariationSchema = z.object({
  size: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  sku: z.string().min(1, 'Введите SKU').max(100, 'Максимум 100 символов'),
  barcode: z.string().optional().or(z.literal('')),
  priceAdjustment: z.coerce.number(),
});
export type ProductVariationFormValues = z.infer<typeof productVariationSchema>;
export type ProductVariationFormInput = z.input<typeof productVariationSchema>;
