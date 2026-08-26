import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select } from '@/components';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import formStyles from '../_shared/CrudForm.module.css';

interface InventoryStartFormProps {
  onSubmit: (warehouseId: string) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function InventoryStartForm({ onSubmit, onCancel, isSaving, serverError }: InventoryStartFormProps) {
  const { currentBranch } = useStoreBranch();
  const [warehouseId, setWarehouseId] = useState('');

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', currentBranch?.id],
    queryFn: () => warehousesApi.listAllWarehouses(currentBranch!.id),
    enabled: Boolean(currentBranch),
  });

  return (
    <div className={formStyles.form}>
      {serverError && <div className={formStyles.error}>{serverError}</div>}
      <Select label="Склад" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
        <option value="">Выберите склад</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>
      <div className={formStyles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!warehouseId || isSaving}
          onClick={() => onSubmit(warehouseId)}
        >
          {isSaving ? 'Создаём…' : 'Начать ревизию'}
        </Button>
      </div>
    </div>
  );
}
