import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Loader, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as transfersApi from '@/api/endpoints/transfers';
import { extractErrorMessage } from '@/api/client';
import { formatDate } from '@/lib/format';
import { useProductName, useWarehousesLookup } from '@/lib/lookups';
import { TransferStatus } from '@/types/domain';
import { TRANSFER_STATUS_LABEL, TRANSFER_STATUS_TONE } from './labels';
import styles from '../_shared/CrudForm.module.css';

function ProductCell({ productId }: { productId: string }) {
  const name = useProductName(productId);
  return <>{name ?? '…'}</>;
}

export function TransferDetail({ transferId, onClose }: { transferId: string; onClose: () => void }) {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const { nameOf: warehouseName } = useWarehousesLookup();

  const { data: transfer, isLoading } = useQuery({
    queryKey: ['transfer', transferId],
    queryFn: () => transfersApi.getTransfer(transferId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['transfer', transferId] });
    queryClient.invalidateQueries({ queryKey: ['transfers'] });
  }

  const submitMutation = useMutation({ mutationFn: () => transfersApi.submitTransfer(transferId), onSuccess: invalidate });
  const approveMutation = useMutation({ mutationFn: () => transfersApi.approveTransfer(transferId), onSuccess: invalidate });
  const shipMutation = useMutation({ mutationFn: () => transfersApi.shipTransfer(transferId), onSuccess: invalidate });
  const receiveMutation = useMutation({ mutationFn: () => transfersApi.receiveTransfer(transferId), onSuccess: invalidate });
  const cancelMutation = useMutation({ mutationFn: () => transfersApi.cancelTransfer(transferId), onSuccess: invalidate });

  const busy =
    submitMutation.isPending ||
    approveMutation.isPending ||
    shipMutation.isPending ||
    receiveMutation.isPending ||
    cancelMutation.isPending;
  const error =
    submitMutation.error ?? approveMutation.error ?? shipMutation.error ?? receiveMutation.error ?? cancelMutation.error;

  const canApprove = has('Inventory.Approve');
  const canManage = has('Inventory.Create');

  if (isLoading || !transfer) {
    return <Loader />;
  }

  return (
    <div className={styles.form}>
      {error && <div className={styles.error}>{extractErrorMessage(error)}</div>}

      <div>
        <Badge tone={TRANSFER_STATUS_TONE[transfer.status]}>{TRANSFER_STATUS_LABEL[transfer.status]}</Badge>
      </div>

      <div>
        <div>Откуда: {warehouseName(transfer.sourceWarehouseId)}</div>
        <div>Куда: {warehouseName(transfer.destinationWarehouseId)}</div>
        <div>Дата: {formatDate(transfer.transferDate)}</div>
        {transfer.notes && <div>Заметки: {transfer.notes}</div>}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Товар</Th>
            <Th>Кол-во</Th>
          </tr>
        </thead>
        <tbody>
          {transfer.items.map((item) => (
            <tr key={item.id}>
              <Td>
                <ProductCell productId={item.productId} />
              </Td>
              <Td className="font-data">{item.quantity}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
        {canManage && transfer.status === TransferStatus.Draft && (
          <Button variant="primary" disabled={busy} onClick={() => submitMutation.mutate()}>
            Отправить на согласование
          </Button>
        )}
        {canApprove && transfer.status === TransferStatus.Pending && (
          <Button variant="primary" disabled={busy} onClick={() => approveMutation.mutate()}>
            Согласовать
          </Button>
        )}
        {canManage && transfer.status === TransferStatus.Approved && (
          <Button variant="primary" disabled={busy} onClick={() => shipMutation.mutate()}>
            Отгрузить
          </Button>
        )}
        {canManage && transfer.status === TransferStatus.Shipped && (
          <Button variant="primary" disabled={busy} onClick={() => receiveMutation.mutate()}>
            Принять
          </Button>
        )}
        {canManage &&
          (transfer.status === TransferStatus.Draft ||
            transfer.status === TransferStatus.Pending ||
            transfer.status === TransferStatus.Approved) && (
            <Button variant="ghost" disabled={busy} onClick={() => cancelMutation.mutate()}>
              Отменить
            </Button>
          )}
      </div>
    </div>
  );
}
