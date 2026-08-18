import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as transfersApi from '@/api/endpoints/transfers';
import { extractErrorMessage } from '@/api/client';
import type { TransferDto } from '@/types/domain';
import { TransferForm, type TransferSubmitValues } from './TransferForm';
import { TransferDetailModal } from './TransferDetailModal';
import { TRANSFER_STATUS_LABEL, TRANSFER_STATUS_TONE } from './labels';
import styles from './TransfersPage.module.css';

const PAGE_SIZE = 20;

export function TransfersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<TransferDto | null>(null);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['transfers', pageNumber, status],
    queryFn: () => transfersApi.listTransfers({ pageNumber, pageSize: PAGE_SIZE, status: status ? Number(status) : undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (values: TransferSubmitValues) =>
      transfersApi.createTransfer({
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        items: values.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setCreating(false);
    },
  });

  const canCreate = has('Transfers.Create');

  return (
    <div>
      <PageHeader
        title="Перемещения"
        subtitle="Перемещения товаров между складами и филиалами"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новое перемещение
            </Button>
          )
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.statusSelect}>
          <Select
            label="Статус"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">Все статусы</option>
            {Object.entries(TRANSFER_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Перемещений пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Номер</Th>
                <Th>Откуда</Th>
                <Th>Куда</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((transfer) => (
                <tr key={transfer.id}>
                  <Td className="font-data">{transfer.transferNumber}</Td>
                  <Td>{transfer.fromWarehouseName}</Td>
                  <Td>{transfer.toWarehouseName}</Td>
                  <Td>
                    <Badge tone={TRANSFER_STATUS_TONE[transfer.status]}>{TRANSFER_STATUS_LABEL[transfer.status]}</Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewing(transfer)}>
                      Просмотреть
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            pageNumber={page.pageNumber}
            totalPages={page.totalPages}
            hasPreviousPage={page.hasPreviousPage}
            hasNextPage={page.hasNextPage}
            onChange={setPageNumber}
          />
        </>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Новое перемещение">
        <TransferForm
          onSubmit={(values) => createMutation.mutate(values)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <TransferDetailModal transfer={viewing} onClose={() => setViewing(null)} onUpdated={setViewing} />
    </div>
  );
}
