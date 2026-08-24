import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Modal, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as transfersApi from '@/api/endpoints/transfers';
import { extractErrorMessage } from '@/api/client';
import { TransferStatus, type TransferDto } from '@/types/domain';
import { useProductLookup } from '../_shared/useProductLookup';
import { TRANSFER_STATUS_LABEL, TRANSFER_STATUS_TONE } from './labels';
import formStyles from '../_shared/CrudForm.module.css';

interface TransferDetailModalProps {
  transfer: TransferDto | null;
  sourceWarehouseName: string | undefined;
  destinationWarehouseName: string | undefined;
  onClose: () => void;
  onUpdated: (transfer: TransferDto) => void;
}

export function TransferDetailModal({
  transfer,
  sourceWarehouseName,
  destinationWarehouseName,
  onClose,
  onUpdated,
}: TransferDetailModalProps) {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const { getName, getSku } = useProductLookup((transfer?.items ?? []).map((i) => i.productId));

  const onTransitionSuccess = (updated: TransferDto) => {
    queryClient.invalidateQueries({ queryKey: ['transfers'] });
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    onUpdated(updated);
  };
  const submitMutation = useMutation({ mutationFn: transfersApi.submitTransfer, onSuccess: onTransitionSuccess });
  const approveMutation = useMutation({ mutationFn: transfersApi.approveTransfer, onSuccess: onTransitionSuccess });
  const shipMutation = useMutation({ mutationFn: transfersApi.shipTransfer, onSuccess: onTransitionSuccess });
  const receiveMutation = useMutation({ mutationFn: transfersApi.receiveTransfer, onSuccess: onTransitionSuccess });
  const cancelMutation = useMutation({ mutationFn: transfersApi.cancelTransfer, onSuccess: onTransitionSuccess });

  if (!transfer) return null;

  // Отдельных Transfers.* прав в каталоге нет — Inventory.Create покрывает обычные переходы,
  // Inventory.Approve зарезервирован именно за шагом "Одобрить" (совпадает по смыслу с
  // Inventory.Approve для ревизий — то же слово, тот же уровень допуска).
  const canUpdate = has('Inventory.Create');
  const canApprove = has('Inventory.Approve');
  const isBusy =
    submitMutation.isPending ||
    approveMutation.isPending ||
    shipMutation.isPending ||
    receiveMutation.isPending ||
    cancelMutation.isPending;
  const error =
    submitMutation.error ??
    approveMutation.error ??
    shipMutation.error ??
    receiveMutation.error ??
    cancelMutation.error;

  const canCancel = canUpdate && transfer.status !== TransferStatus.Received && transfer.status !== TransferStatus.Cancelled;

  return (
    <Modal open={Boolean(transfer)} onClose={onClose} title={`Перемещение ${transfer.transferNumber}`}>
      <div className={formStyles.form}>
        {error ? <div className={formStyles.error}>{extractErrorMessage(error)}</div> : null}

        <div>
          <Badge tone={TRANSFER_STATUS_TONE[transfer.status]}>{TRANSFER_STATUS_LABEL[transfer.status]}</Badge>
        </div>

        <Table>
          <tbody>
            <tr>
              <Td>Откуда</Td>
              <Td>{sourceWarehouseName ?? '—'}</Td>
            </tr>
            <tr>
              <Td>Куда</Td>
              <Td>{destinationWarehouseName ?? '—'}</Td>
            </tr>
          </tbody>
        </Table>

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
                  {getName(item.productId)}
                  <br />
                  <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                    {getSku(item.productId)}
                  </span>
                </Td>
                <Td numeric>{item.quantity}</Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className={formStyles.formActions}>
          {canCancel && (
            <Button variant="danger" onClick={() => cancelMutation.mutate(transfer.id)} disabled={isBusy}>
              Отменить
            </Button>
          )}
          {transfer.status === TransferStatus.Draft && canUpdate && (
            <Button variant="primary" onClick={() => submitMutation.mutate(transfer.id)} disabled={isBusy}>
              Отправить на согласование
            </Button>
          )}
          {transfer.status === TransferStatus.Pending && canApprove && (
            <Button variant="primary" onClick={() => approveMutation.mutate(transfer.id)} disabled={isBusy}>
              Одобрить
            </Button>
          )}
          {transfer.status === TransferStatus.Approved && canUpdate && (
            <Button variant="primary" onClick={() => shipMutation.mutate(transfer.id)} disabled={isBusy}>
              Отправить
            </Button>
          )}
          {transfer.status === TransferStatus.Shipped && canUpdate && (
            <Button variant="primary" onClick={() => receiveMutation.mutate(transfer.id)} disabled={isBusy}>
              Принять
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}
