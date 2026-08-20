import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Select, Table, Td, TextField, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as inventoriesApi from '@/api/endpoints/inventories';
import { extractErrorMessage } from '@/api/client';
import { formatDate } from '@/lib/format';
import { useWarehousesLookup } from '@/lib/lookups';
import type { CreateInventoryRequest } from '@/types/domain';
import { InventoryDetail } from './InventoryDetail';
import { INVENTORY_STATUS_LABEL, INVENTORY_STATUS_TONE } from './labels';
import styles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function InventoriesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { warehouses, nameOf: warehouseName } = useWarehousesLookup();

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
    mutationFn: (payload: CreateInventoryRequest) => inventoriesApi.createInventory(payload),
    onSuccess: (inventory) => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setCreating(false);
      setViewingId(inventory.id);
    },
  });

  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PageHeader
        title="Ревизии"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новая ревизия
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
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((inventory) => (
                <tr key={inventory.id}>
                  <Td className="font-data">{inventory.inventoryNumber}</Td>
                  <Td>{warehouseName(inventory.warehouseId)}</Td>
                  <Td className="font-data">{formatDate(inventory.startedAt)}</Td>
                  <Td>
                    <Badge tone={INVENTORY_STATUS_TONE[inventory.status]}>
                      {INVENTORY_STATUS_LABEL[inventory.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewingId(inventory.id)}>
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Новая ревизия">
        <CreateInventoryForm
          warehouses={warehouses}
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <Modal open={viewingId !== null} onClose={() => setViewingId(null)} title="Ревизия">
        {viewingId && <InventoryDetail inventoryId={viewingId} onClose={() => setViewingId(null)} />}
      </Modal>
    </div>
  );
}

function CreateInventoryForm({
  warehouses,
  onSubmit,
  onCancel,
  isSaving,
  serverError,
}: {
  warehouses: { id: string; name: string }[];
  onSubmit: (payload: CreateInventoryRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? '');
  const [notes, setNotes] = useState('');

  return (
    <div className={styles.form}>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <Select label="Склад" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>
      <TextField label="Заметки (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!warehouseId || isSaving}
          onClick={() => onSubmit({ warehouseId, notes: notes || undefined })}
        >
          {isSaving ? 'Создаём…' : 'Начать ревизию'}
        </Button>
      </div>
    </div>
  );
}
