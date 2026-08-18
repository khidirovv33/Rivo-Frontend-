import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import * as categoriesApi from '@/api/endpoints/categories';
import * as brandsApi from '@/api/endpoints/brands';
import { productSchema, type ProductFormInput, type ProductFormValues } from '@/lib/validation/catalog';
import { ProductStatus, type ProductDto } from '@/types/domain';
import { PRODUCT_STATUS_LABEL } from './labels';
import styles from '../_shared/CrudForm.module.css';

interface ProductFormProps {
  product: ProductDto | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function ProductForm({ product, onSubmit, onCancel, isSaving, serverError }: ProductFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.listCategories });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.listBrands });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      barcode: product?.barcode ?? '',
      categoryId: product?.categoryId ?? '',
      brandId: product?.brandId ?? '',
      description: product?.description ?? '',
      imageUrl: product?.imageUrl ?? '',
      purchasePrice: product?.purchasePrice ?? 0,
      sellingPrice: product?.sellingPrice ?? 0,
      wholesalePrice: product?.wholesalePrice ?? undefined,
      minimumPrice: product?.minimumPrice ?? undefined,
      unit: product?.unit ?? 'шт',
      minimumStock: product?.minimumStock ?? 0,
      maximumStock: product?.maximumStock ?? undefined,
      taxRate: product?.taxRate ?? 0,
      status: product?.status ?? ProductStatus.Active,
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <TextField label="Название" error={errors.name?.message} {...register('name')} />
      <TextField label="SKU" error={errors.sku?.message} {...register('sku')} />
      <TextField label="Штрихкод (необязательно)" error={errors.barcode?.message} {...register('barcode')} />

      <Select label="Категория (необязательно)" error={errors.categoryId?.message} {...register('categoryId')}>
        <option value="">Без категории</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select label="Бренд (необязательно)" error={errors.brandId?.message} {...register('brandId')}>
        <option value="">Без бренда</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>

      <TextField
        label="Закупочная цена"
        type="number"
        step="0.01"
        error={errors.purchasePrice?.message}
        {...register('purchasePrice')}
      />
      <TextField
        label="Цена продажи"
        type="number"
        step="0.01"
        error={errors.sellingPrice?.message}
        {...register('sellingPrice')}
      />
      <TextField
        label="Оптовая цена (необязательно)"
        type="number"
        step="0.01"
        error={errors.wholesalePrice?.message}
        {...register('wholesalePrice')}
      />
      <TextField
        label="Минимальная цена (необязательно)"
        type="number"
        step="0.01"
        error={errors.minimumPrice?.message}
        {...register('minimumPrice')}
      />
      <TextField label="Единица измерения" error={errors.unit?.message} {...register('unit')} />
      <TextField
        label="Минимальный остаток"
        type="number"
        error={errors.minimumStock?.message}
        {...register('minimumStock')}
      />
      <TextField
        label="Максимальный остаток (необязательно)"
        type="number"
        error={errors.maximumStock?.message}
        {...register('maximumStock')}
      />
      <TextField
        label="Ставка налога, %"
        type="number"
        step="0.01"
        error={errors.taxRate?.message}
        {...register('taxRate')}
      />

      {product && (
        <Select label="Статус" error={errors.status?.message} {...register('status')}>
          {Object.entries(PRODUCT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}
