import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import { useSuppliersLookup, useWarehousesLookup } from '@/lib/lookups';
import type { CreatePurchaseOrderRequest } from '@/types/domain';
import { PurchaseOrderDetail } from './PurchaseOrderDetail';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { PurchasesTabs } from './PurchasesTabs';
import { PURCHASE_ORDER_STATUS_LABEL, PURCHASE_ORDER_STATUS_TONE } from './labels';

const PAGE_SIZE = 20;

export function PurchaseOrdersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { nameOf: supplierName } = useSuppliersLookup();
  const { nameOf: warehouseName } = useWarehousesLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchase-orders', pageNumber],
    queryFn: () => purchaseOrdersApi.listPurchaseOrders({ pageNumber, pageSize: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseOrderRequest) => purchaseOrdersApi.createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setCreating(false);
    },
  });

  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader
        title="Заказы поставщикам"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новый заказ
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Заказов пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Номер</Th>
                <Th>Поставщик</Th>
                <Th>Склад</Th>
                <Th>Дата</Th>
                <Th>Статус</Th>
                <Th>Сумма</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((order) => (
                <tr key={order.id}>
                  <Td className="font-data">{order.orderNumber}</Td>
                  <Td>{supplierName(order.supplierId)}</Td>
                  <Td>{warehouseName(order.warehouseId)}</Td>
                  <Td className="font-data">{formatDate(order.orderDate)}</Td>
                  <Td>
                    <Badge tone={PURCHASE_ORDER_STATUS_TONE[order.status]}>
                      {PURCHASE_ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </Td>
                  <Td numeric className="font-data">{formatMoney(order.totalAmount)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewingId(order.id)}>
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Новый заказ поставщику">
        <PurchaseOrderForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <Modal open={viewingId !== null} onClose={() => setViewingId(null)} title="Заказ поставщику">
        {viewingId && <PurchaseOrderDetail orderId={viewingId} onClose={() => setViewingId(null)} />}
      </Modal>
    </div>
  );
}
