import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import * as productsApi from '@/api/endpoints/products';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import {
  productVariationSchema,
  type ProductVariationFormInput,
  type ProductVariationFormValues,
} from '@/lib/validation/catalog';
import type { ProductVariationDto } from '@/types/domain';
import formStyles from '../_shared/CrudForm.module.css';
import styles from './VariationsPanel.module.css';

interface VariationsPanelProps {
  productId: string;
  variations: ProductVariationDto[];
  onRefresh: () => void;
}

export function VariationsPanel({ productId, variations, onRefresh }: VariationsPanelProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductVariationFormValues) => {
      const payload = {
        size: values.size || undefined,
        color: values.color || undefined,
        sku: values.sku,
        barcode: values.barcode || undefined,
        priceAdjustment: values.priceAdjustment,
      };
      if (editingId) {
        return productsApi.updateVariation(productId, editingId, payload);
      }
      return productsApi.createVariation(productId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onRefresh();
      setAdding(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (variationId: string) => productsApi.deleteVariation(productId, variationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onRefresh();
    },
  });

  function handleDelete(variation: ProductVariationDto) {
    if (window.confirm(`Удалить вариацию «${variation.sku}»?`)) {
      deleteMutation.mutate(variation.id);
    }
  }

  const editingVariation = variations.find((v) => v.id === editingId) ?? null;
  const showForm = adding || editingId !== null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <span className={styles.headingTitle}>Вариации (размер / цвет)</span>
        {!showForm && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <PlusIcon width={14} height={14} />
            Добавить
          </Button>
        )}
      </div>

      {variations.map((variation) => (
        <div key={variation.id} className={styles.row}>
          <span className={[styles.cell, styles.grow].join(' ')}>
            {[variation.size, variation.color].filter(Boolean).join(' / ') || '—'} · {variation.sku}
          </span>
          <span className={[styles.cell, 'font-data'].join(' ')}>
            {variation.priceAdjustment >= 0 ? '+' : ''}
            {formatMoney(variation.priceAdjustment)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingId(variation.id);
              setAdding(false);
            }}
            aria-label="Изменить"
          >
            <EditIcon width={14} height={14} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(variation)} aria-label="Удалить">
            <TrashIcon width={14} height={14} />
          </Button>
        </div>
      ))}

      {variations.length === 0 && !showForm && (
        <p className={styles.cell} style={{ color: 'var(--ink-faint)' }}>
          Вариаций пока нет.
        </p>
      )}

      {showForm && (
        <VariationForm
          variation={editingVariation}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={() => {
            setAdding(false);
            setEditingId(null);
          }}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      )}
    </div>
  );
}

function VariationForm({
  variation,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  variation: ProductVariationDto | null;
  onSubmit: (values: ProductVariationFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductVariationFormInput, unknown, ProductVariationFormValues>({
    resolver: zodResolver(productVariationSchema),
    defaultValues: {
      size: variation?.size ?? '',
      color: variation?.color ?? '',
      sku: variation?.sku ?? '',
      barcode: variation?.barcode ?? '',
      priceAdjustment: variation?.priceAdjustment ?? 0,
    },
  });

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={formStyles.error}>{serverError}</div>}
      <div className={styles.addForm}>
        <div className={styles.addField}>
          <TextField label="Размер" error={errors.size?.message} {...register('size')} />
        </div>
        <div className={styles.addField}>
          <TextField label="Цвет" error={errors.color?.message} {...register('color')} />
        </div>
        <div className={styles.addField}>
          <TextField label="SKU" error={errors.sku?.message} {...register('sku')} />
        </div>
        <div className={styles.addField}>
          <TextField label="Штрихкод" error={errors.barcode?.message} {...register('barcode')} />
        </div>
        <div className={styles.addField}>
          <TextField
            label="Наценка/скидка"
            type="number"
            step="0.01"
            error={errors.priceAdjustment?.message}
            {...register('priceAdjustment')}
          />
        </div>
      </div>
      <div className={formStyles.formActions}>
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
