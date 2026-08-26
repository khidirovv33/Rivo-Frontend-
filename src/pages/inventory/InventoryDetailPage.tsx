import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, ErrorState, Loader, PageHeader, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as inventoriesApi from '@/api/endpoints/inventories';
import { extractErrorMessage } from '@/api/client';
import { InventoryStatus } from '@/types/domain';
import { INVENTORY_STATUS_LABEL, INVENTORY_STATUS_TONE } from './labels';
import styles from './InventoryDetailPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [actuals, setActuals] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (!inventory) return;
    const initial: Record<string, string> = {};
    for (const item of inventory.items) {
      initial[item.id] = item.actualQuantity === null ? '' : String(item.actualQuantity);
    }
    setActuals(initial);
  }, [inventory]);

  const saveItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      inventoriesApi.updateInventoryItem(id!, itemId, { actualQuantity: quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', id] }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => inventoriesApi.confirmInventory(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', id] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
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
  const isBusy = confirmMutation.isPending || cancelMutation.isPending;

  function commitItem(itemId: string) {
    const raw = actuals[itemId];
    const quantity = raw === '' ? null : Number(raw);
    if (quantity === null || Number.isNaN(quantity)) return;
    const original = inventory!.items.find((i) => i.id === itemId)?.actualQuantity ?? null;
    if (quantity === original) return;
    saveItemMutation.mutate({ itemId, quantity });
  }

  return (
    <div>
      <PageHeader title={`Ревизия — ${inventory.warehouseName}`} />

      <div className={styles.summary}>
        <Badge tone={INVENTORY_STATUS_TONE[inventory.status]}>{INVENTORY_STATUS_LABEL[inventory.status]}</Badge>
      </div>

      {(confirmMutation.error || cancelMutation.error) && (
        <div className={formStyles.error}>
          {extractErrorMessage(confirmMutation.error ?? cancelMutation.error)}
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Товар</Th>
            <Th>Системный остаток</Th>
            <Th>Факт</Th>
            <Th>Разница</Th>
          </tr>
        </thead>
        <tbody>
          {inventory.items.map((item) => {
            const rawValue = actuals[item.id] ?? '';
            const actual = rawValue === '' ? null : Number(rawValue);
            const difference = actual === null || Number.isNaN(actual) ? null : actual - item.systemQuantity;
            return (
              <tr key={item.id}>
                <Td>
                  {item.productName}
                  <br />
                  <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                    {item.productSku}
                  </span>
                </Td>
                <Td numeric>{item.systemQuantity}</Td>
                <Td>
                  <input
                    className={styles.actualInput}
                    type="number"
                    min={0}
                    disabled={!canEdit}
                    value={rawValue}
                    onChange={(e) => setActuals((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    onBlur={() => commitItem(item.id)}
                  />
                </Td>
                <Td numeric>
                  {difference === null ? (
                    '—'
                  ) : (
                    <Badge tone={difference === 0 ? 'good' : difference < 0 ? 'critical' : 'warn'}>
                      {difference > 0 ? `+${difference}` : difference}
                    </Badge>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate('/inventory')}>
          К списку
        </Button>
        {inventory.status === InventoryStatus.InProgress && canEdit && (
          <Button variant="danger" onClick={() => cancelMutation.mutate()} disabled={isBusy}>
            Отменить ревизию
          </Button>
        )}
        {inventory.status === InventoryStatus.InProgress && canApprove && (
          <Button variant="primary" onClick={() => confirmMutation.mutate()} disabled={isBusy}>
            {confirmMutation.isPending ? 'Подтверждаем…' : 'Подтвердить ревизию'}
          </Button>
        )}
      </div>
    </div>
  );
}
