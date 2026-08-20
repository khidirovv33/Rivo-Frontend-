import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as receivingApi from '@/api/endpoints/receiving';
import { extractErrorMessage } from '@/api/client';
import { formatDate } from '@/lib/format';
import { useWarehousesLookup } from '@/lib/lookups';
import type { CreateReceivingRequest } from '@/types/domain';
import { ReceivingForm } from './ReceivingForm';
import { PurchasesTabs } from './PurchasesTabs';
import { RECEIVING_STATUS_LABEL, RECEIVING_STATUS_TONE } from './labels';

const PAGE_SIZE = 20;

export function ReceivingPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);
  const { nameOf: warehouseName } = useWarehousesLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['receiving', pageNumber],
    queryFn: () => receivingApi.listReceiving({ pageNumber, pageSize: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateReceivingRequest) => receivingApi.createReceiving(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receiving'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setCreating(false);
    },
  });

  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader
        title="Приёмки"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новая приёмка
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Приёмок пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Склад</Th>
                <Th>Дата</Th>
                <Th>Статус</Th>
                <Th>Позиций</Th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((receiving) => (
                <tr key={receiving.id}>
                  <Td>{warehouseName(receiving.warehouseId)}</Td>
                  <Td className="font-data">{formatDate(receiving.receivingDate)}</Td>
                  <Td>
                    <Badge tone={RECEIVING_STATUS_TONE[receiving.status]}>
                      {RECEIVING_STATUS_LABEL[receiving.status]}
                    </Badge>
                  </Td>
                  <Td numeric className="font-data">{receiving.items.length}</Td>
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Новая приёмка">
        <ReceivingForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
