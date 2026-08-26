import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button, EmptyState, Select, Table, Td, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { transferHeaderSchema, type TransferHeaderValues } from '@/lib/validation/inventory';
import { ProductPicker } from '../_shared/ProductPicker';
import type { ProductDto } from '@/types/domain';
import formStyles from '../_shared/CrudForm.module.css';
import styles from '../purchases/PurchaseOrderForm.module.css';

interface DraftItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
}

export interface TransferSubmitValues extends TransferHeaderValues {
  items: DraftItem[];
}

interface TransferFormProps {
  onSubmit: (values: TransferSubmitValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function TransferForm({ onSubmit, onCancel, isSaving, serverError }: TransferFormProps) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.listAllWarehouses() });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferHeaderValues>({
    resolver: zodResolver(transferHeaderSchema),
    defaultValues: { sourceWarehouseId: '', destinationWarehouseId: '' },
  });

  function addProduct(product: ProductDto) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      return [...prev, { productId: product.id, productName: product.name, productSku: product.sku, quantity: 1 }];
    });
    setItemsError(null);
  }

  function updateItem(productId: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function submit(values: TransferHeaderValues) {
    if (items.length === 0) {
      setItemsError('Добавьте хотя бы одну позицию');
      return;
    }
    onSubmit({ ...values, items });
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className={formStyles.error}>{serverError}</div>}

      <Select label="Склад-отправитель" error={errors.sourceWarehouseId?.message} {...register('sourceWarehouseId')}>
        <option value="">Выберите склад</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>

      <Select label="Склад-получатель" error={errors.destinationWarehouseId?.message} {...register('destinationWarehouseId')}>
        <option value="">Выберите склад</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>

      <div className={styles.itemsSection}>
        <span className={styles.itemsLabel}>Позиции перемещения</span>
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
                      onChange={(e) => updateItem(item.productId, Math.max(1, Number(e.target.value) || 1))}
                    />
                  </Td>
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
      </div>

      <div className={formStyles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Создаём…' : 'Создать перемещение'}
        </Button>
      </div>
    </form>
  );
}
