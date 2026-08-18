import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button, EmptyState, Select, Table, Td, TextField, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import * as suppliersApi from '@/api/endpoints/suppliers';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { formatMoney } from '@/lib/format';
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderValues } from '@/lib/validation/inventory';
import { ProductPicker } from '../_shared/ProductPicker';
import type { ProductDto } from '@/types/domain';
import styles from './PurchaseOrderForm.module.css';
import formStyles from '../_shared/CrudForm.module.css';

interface DraftItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderSubmitValues extends PurchaseOrderHeaderValues {
  items: DraftItem[];
}

interface PurchaseOrderFormProps {
  branchId: string | undefined;
  onSubmit: (values: PurchaseOrderSubmitValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function PurchaseOrderForm({ branchId, onSubmit, onCancel, isSaving, serverError }: PurchaseOrderFormProps) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers-all'], queryFn: suppliersApi.listAllSuppliers });
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', branchId],
    queryFn: () => warehousesApi.listAllWarehouses(branchId),
    enabled: Boolean(branchId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseOrderHeaderValues>({
    resolver: zodResolver(purchaseOrderHeaderSchema),
    defaultValues: { supplierId: '', warehouseId: '', expectedDate: '' },
  });

  function addProduct(product: ProductDto) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      return [...prev, { productId: product.id, productName: product.name, productSku: product.sku, quantity: 1, unitPrice: product.purchasePrice }];
    });
    setItemsError(null);
  }

  function updateItem(productId: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  function submit(values: PurchaseOrderHeaderValues) {
    if (items.length === 0) {
      setItemsError('Добавьте хотя бы одну позицию');
      return;
    }
    onSubmit({ ...values, items });
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className={formStyles.error}>{serverError}</div>}

      <Select label="Поставщик" error={errors.supplierId?.message} {...register('supplierId')}>
        <option value="">Выберите поставщика</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <Select label="Склад приёмки" error={errors.warehouseId?.message} {...register('warehouseId')}>
        <option value="">Выберите склад</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>

      <TextField label="Ожидаемая дата (необязательно)" type="date" error={errors.expectedDate?.message} {...register('expectedDate')} />

      <div className={styles.itemsSection}>
        <span className={styles.itemsLabel}>Позиции заказа</span>
        <ProductPicker onPick={addProduct} />
        {itemsError && <div className={formStyles.error}>{itemsError}</div>}
        {items.length === 0 ? (
          <EmptyState message="Позиции не добавлены." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Товар</Th>
                <Th>Кол-во</Th>
                <Th>Цена</Th>
                <Th>Сумма</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId}>
                  <Td>
                    {item.productName}
                    <br />
                    <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                      {item.productSku}
                    </span>
                  </Td>
                  <Td>
                    <input
                      className={styles.qtyInput}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.productId, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </Td>
                  <Td>
                    <input
                      className={styles.priceInput}
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.productId, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </Td>
                  <Td numeric>{formatMoney(item.quantity * item.unitPrice)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)} aria-label="Убрать">
                      <TrashIcon width={15} height={15} />
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {items.length > 0 && (
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Итого:</span>
            <span className={styles.totalValue}>{formatMoney(total)}</span>
          </div>
        )}
      </div>

      <div className={formStyles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Создаём…' : 'Создать заказ'}
        </Button>
      </div>
    </form>
  );
}
