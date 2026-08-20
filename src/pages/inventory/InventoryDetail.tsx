import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Loader, Table, Td, TextField, Th } from '@/components';
import { TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as inventoriesApi from '@/api/endpoints/inventories';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import { useProductName } from '@/lib/lookups';
import { ProductPicker } from '../_shared/ProductPicker';
import { InventoryStatus } from '@/types/domain';
import { INVENTORY_STATUS_LABEL, INVENTORY_STATUS_TONE } from './labels';
import styles from '../_shared/CrudForm.module.css';

function ProductCell({ productId }: { productId: string }) {
  const name = useProductName(productId);
  return <>{name ?? '…'}</>;
}

export function InventoryDetail({ inventoryId, onClose }: { inventoryId: string; onClose: () => void }) {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [scanProductId, setScanProductId] = useState<string | null>(null);
  const [scanProductName, setScanProductName] = useState('');
  const [actualQuantity, setActualQuantity] = useState(0);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', inventoryId],
    queryFn: () => inventoriesApi.getInventory(inventoryId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['inventory', inventoryId] });
    queryClient.invalidateQueries({ queryKey: ['inventories'] });
  }

  const scanMutation = useMutation({
    mutationFn: () => inventoriesApi.scanInventoryItem(inventoryId, { productId: scanProductId!, actualQuantity }),
    onSuccess: () => {
      invalidate();
      setScanProductId(null);
      setScanProductName('');
      setActualQuantity(0);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => inventoriesApi.removeInventoryItem(inventoryId, itemId),
    onSuccess: invalidate,
  });

  const completeMutation = useMutation({ mutationFn: () => inventoriesApi.completeInventory(inventoryId), onSuccess: invalidate });
  const approveMutation = useMutation({ mutationFn: () => inventoriesApi.approveInventory(inventoryId), onSuccess: invalidate });
  const cancelMutation = useMutation({ mutationFn: () => inventoriesApi.cancelInventory(inventoryId), onSuccess: invalidate });

  if (isLoading || !inventory) {
    return <Loader />;
  }

  const canManage = has('Inventory.Create');
  const canApprove = has('Inventory.Approve');
  const busy = completeMutation.isPending || approveMutation.isPending || cancelMutation.isPending;
  const error =
    scanMutation.error ?? removeMutation.error ?? completeMutation.error ?? approveMutation.error ?? cancelMutation.error;

  return (
    <div className={styles.form}>
      {error && <div className={styles.error}>{extractErrorMessage(error)}</div>}

      <div>
        <Badge tone={INVENTORY_STATUS_TONE[inventory.status]}>{INVENTORY_STATUS_LABEL[inventory.status]}</Badge>
      </div>

      {inventory.notes && <div>Заметки: {inventory.notes}</div>}

      {canManage && inventory.status === InventoryStatus.Draft && (
        <div>
          <ProductPicker
            onPick={(product) => {
              setScanProductId(product.id);
              setScanProductName(product.name);
            }}
          />
          {scanProductId && (
            <div className={styles.formActions}>
              <span>{scanProductName}</span>
              <TextField
                label="Фактическое количество"
                type="number"
                min={0}
                step="0.01"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(Math.max(0, Number(e.target.value) || 0))}
              />
              <Button variant="primary" disabled={scanMutation.isPending} onClick={() => scanMutation.mutate()}>
                Добавить
              </Button>
            </div>
          )}
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Товар</Th>
            <Th>Учётный остаток</Th>
            <Th>Фактически</Th>
            <Th>Разница</Th>
            <Th>Разница, сум</Th>
            {canManage && inventory.status === InventoryStatus.Draft && <Th />}
          </tr>
        </thead>
        <tbody>
          {inventory.items.map((item) => (
            <tr key={item.id}>
              <Td>
                <ProductCell productId={item.productId} />
              </Td>
              <Td numeric className="font-data">{item.systemQuantity}</Td>
              <Td numeric className="font-data">{item.actualQuantity}</Td>
              <Td numeric className="font-data">
                <Badge tone={item.difference === 0 ? 'neutral' : item.difference > 0 ? 'good' : 'critical'}>
                  {item.difference > 0 ? `+${item.difference}` : item.difference}
                </Badge>
              </Td>
              <Td numeric className="font-data">{formatMoney(item.differenceCost)}</Td>
              {canManage && inventory.status === InventoryStatus.Draft && (
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate(item.id)} aria-label="Удалить">
                    <TrashIcon width={15} height={15} />
                  </Button>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <div>
        <div>Недостача: {inventory.shortageQuantity} шт. ({formatMoney(inventory.shortageCost)})</div>
        <div>Излишек: {inventory.surplusQuantity} шт. ({formatMoney(inventory.surplusCost)})</div>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
        {canManage && inventory.status === InventoryStatus.Draft && (
          <Button variant="primary" disabled={busy || inventory.items.length === 0} onClick={() => completeMutation.mutate()}>
            Завершить пересчёт
          </Button>
        )}
        {canApprove && inventory.status === InventoryStatus.Completed && (
          <Button variant="primary" disabled={busy} onClick={() => approveMutation.mutate()}>
            Утвердить (скорректировать остатки)
          </Button>
        )}
        {canManage && (inventory.status === InventoryStatus.Draft || inventory.status === InventoryStatus.Completed) && (
          <Button variant="ghost" disabled={busy} onClick={() => cancelMutation.mutate()}>
            Отменить
          </Button>
        )}
      </div>
    </div>
  );
}
