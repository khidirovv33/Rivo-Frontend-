import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as transfersApi from '@/api/endpoints/transfers';
import { extractErrorMessage } from '@/api/client';
import { formatDate } from '@/lib/format';
import { useWarehousesLookup } from '@/lib/lookups';
import type { CreateTransferRequest } from '@/types/domain';
import { TransferDetail } from './TransferDetail';
import { TransferForm } from './TransferForm';
import { TRANSFER_STATUS_LABEL, TRANSFER_STATUS_TONE } from './labels';

const PAGE_SIZE = 20;

export function TransfersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { nameOf: warehouseName } = useWarehousesLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['transfers', pageNumber],
    queryFn: () => transfersApi.listTransfers({ pageNumber, pageSize: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTransferRequest) => transfersApi.createTransfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setCreating(false);
    },
  });

  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PageHeader
        title="Перемещения"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новое перемещение
            </Button>
          )
        }
      />

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
                <Th>Дата</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((transfer) => (
                <tr key={transfer.id}>
                  <Td className="font-data">{transfer.transferNumber}</Td>
                  <Td>{warehouseName(transfer.sourceWarehouseId)}</Td>
                  <Td>{warehouseName(transfer.destinationWarehouseId)}</Td>
                  <Td className="font-data">{formatDate(transfer.transferDate)}</Td>
                  <Td>
                    <Badge tone={TRANSFER_STATUS_TONE[transfer.status]}>{TRANSFER_STATUS_LABEL[transfer.status]}</Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewingId(transfer.id)}>
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
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <Modal open={viewingId !== null} onClose={() => setViewingId(null)} title="Перемещение">
        {viewingId && <TransferDetail transferId={viewingId} onClose={() => setViewingId(null)} />}
      </Modal>
    </div>
  );
}
