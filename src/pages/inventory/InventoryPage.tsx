import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as inventoriesApi from '@/api/endpoints/inventories';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { extractErrorMessage } from '@/api/client';
import { formatDateTime } from '@/lib/format';
import { InventoryStartForm } from './InventoryStartForm';
import { INVENTORY_STATUS_LABEL, INVENTORY_STATUS_TONE } from './labels';

const PAGE_SIZE = 20;

export function InventoryPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.listAllWarehouses() });
  const warehouseNameById = useMemo(() => new Map(warehouses.map((w) => [w.id, w.name])), [warehouses]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['inventories', pageNumber],
    queryFn: () => inventoriesApi.listInventories({ pageNumber, pageSize: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: (warehouseId: string) => inventoriesApi.createInventory({ warehouseId }),
    onSuccess: (inventory) => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setCreating(false);
      navigate(`/inventory/${inventory.id}`);
    },
  });

  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PageHeader
        title="Ревизии"
        subtitle="Сверка системных остатков с фактическим наличием на складе"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Начать ревизию
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Ревизий пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Номер</Th>
                <Th>Склад</Th>
                <Th>Начата</Th>
                <Th>Завершена</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((inventory) => (
                <tr key={inventory.id}>
                  <Td className="font-data">{inventory.inventoryNumber}</Td>
                  <Td>{warehouseNameById.get(inventory.warehouseId) ?? '—'}</Td>
                  <Td className="font-data">{formatDateTime(inventory.startedAt)}</Td>
                  <Td className="font-data">{inventory.completedAt ? formatDateTime(inventory.completedAt) : '—'}</Td>
                  <Td>
                    <Badge tone={INVENTORY_STATUS_TONE[inventory.status]}>
                      {INVENTORY_STATUS_LABEL[inventory.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/${inventory.id}`)}>
                      Открыть
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Начать ревизию">
        <InventoryStartForm
          onSubmit={(warehouseId) => createMutation.mutate(warehouseId)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
