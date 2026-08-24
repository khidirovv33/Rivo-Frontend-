import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, ErrorState, Loader, PageHeader, StatCard, Table, Td, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as inventoriesApi from '@/api/endpoints/inventories';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import { InventoryStatus, type ProductDto } from '@/types/domain';
import { useProductLookup } from '../_shared/useProductLookup';
import { ProductPicker } from '../_shared/ProductPicker';
import { INVENTORY_STATUS_LABEL, INVENTORY_STATUS_TONE } from './labels';
import styles from './InventoryDetailPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [pendingProduct, setPendingProduct] = useState<ProductDto | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);

  const {
    data: inventory,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoriesApi.getInventory(id!),
    enabled: Boolean(id),
  });

  const { data: warehouse } = useQuery({
    queryKey: ['warehouse', inventory?.warehouseId],
    queryFn: () => warehousesApi.getWarehouse(inventory!.warehouseId),
    enabled: Boolean(inventory),
  });

  const { getName, getSku } = useProductLookup((inventory?.items ?? []).map((i) => i.productId));

  const invalidateInventory = () => queryClient.invalidateQueries({ queryKey: ['inventory', id] });

  const scanMutation = useMutation({
    mutationFn: (vars: { productId: string; actualQuantity: number }) =>
      inventoriesApi.scanInventoryItem(id!, vars),
    onSuccess: () => {
      invalidateInventory();
      setPendingProduct(null);
      setPendingQuantity(1);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => inventoriesApi.removeInventoryItem(id!, itemId),
    onSuccess: invalidateInventory,
  });

  const completeMutation = useMutation({
    mutationFn: () => inventoriesApi.completeInventory(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      invalidateInventory();
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => inventoriesApi.approveInventory(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      invalidateInventory();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => inventoriesApi.cancelInventory(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      navigate('/inventory');
    },
  });

  if (isLoading) return <Loader />;
  if (isError || !inventory) return <ErrorState onRetry={() => refetch()} />;

  const canApprove = has('Inventory.Approve');
  const canEdit = inventory.status === InventoryStatus.InProgress && has('Inventory.Create');
  const isBusy = completeMutation.isPending || approveMutation.isPending || cancelMutation.isPending;
  const mutationError = completeMutation.error ?? approveMutation.error ?? cancelMutation.error ?? scanMutation.error;

  return (
    <div>
      <PageHeader title={`Ревизия ${inventory.inventoryNumber}`} subtitle={warehouse?.name} />

      <div className={styles.summary}>
        <Badge tone={INVENTORY_STATUS_TONE[inventory.status]}>{INVENTORY_STATUS_LABEL[inventory.status]}</Badge>
      </div>

      <div className={styles.statRow}>
        <StatCard label="Недостача, шт" value={String(inventory.shortageQuantity)} />
        <StatCard label="Излишек, шт" value={String(inventory.surplusQuantity)} />
        <StatCard label="Недостача, сумма" value={formatMoney(inventory.shortageCost)} />
        <StatCard label="Излишек, сумма" value={formatMoney(inventory.surplusCost)} />
      </div>

      {mutationError && <div className={formStyles.error}>{extractErrorMessage(mutationError)}</div>}

      {canEdit && (
        <div className={styles.scanRow}>
          <div className={styles.scanPicker}>
            <ProductPicker onPick={setPendingProduct} placeholder="Сканируйте штрихкод или введите название/SKU…" />
          </div>
          {pendingProduct && (
            <>
              <input
                className={styles.actualInput}
                type="number"
                min={0}
                value={pendingQuantity}
                onChange={(e) => setPendingQuantity(Math.max(0, Number(e.target.value) || 0))}
              />
              <Button
                variant="primary"
                disabled={scanMutation.isPending}
                onClick={() => scanMutation.mutate({ productId: pendingProduct.id, actualQuantity: pendingQuantity })}
              >
                {scanMutation.isPending ? 'Сохраняем…' : `Внести: ${pendingProduct.name}`}
              </Button>
            </>
          )}
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Товар</Th>
            <Th>Системный остаток</Th>
            <Th>Факт</Th>
            <Th>Разница</Th>
            {canEdit && <Th />}
          </tr>
        </thead>
        <tbody>
          {inventory.items.map((item) => (
            <tr key={item.id}>
              <Td>
                {getName(item.productId)}
                <br />
                <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                  {getSku(item.productId)}
                </span>
              </Td>
              <Td numeric>{item.systemQuantity}</Td>
              <Td numeric>{item.actualQuantity}</Td>
              <Td numeric>
                <Badge tone={item.difference === 0 ? 'good' : item.difference < 0 ? 'critical' : 'warn'}>
                  {item.difference > 0 ? `+${item.difference}` : item.difference}
                </Badge>
              </Td>
              {canEdit && (
                <Td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    aria-label="Убрать позицию"
                  >
                    <TrashIcon width={15} height={15} />
                  </Button>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate('/inventory')}>
          К списку
        </Button>
        {canEdit && (
          <Button variant="danger" onClick={() => cancelMutation.mutate()} disabled={isBusy}>
            Отменить ревизию
          </Button>
        )}
        {canEdit && (
          <Button variant="primary" onClick={() => completeMutation.mutate()} disabled={isBusy}>
            {completeMutation.isPending ? 'Завершаем…' : 'Завершить подсчёт'}
          </Button>
        )}
        {inventory.status === InventoryStatus.Completed && canApprove && (
          <Button variant="primary" onClick={() => approveMutation.mutate()} disabled={isBusy}>
            {approveMutation.isPending ? 'Подтверждаем…' : 'Подтвердить ревизию'}
          </Button>
        )}
      </div>
    </div>
  );
}
