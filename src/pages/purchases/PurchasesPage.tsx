import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as purchaseOrdersApi from '@/api/endpoints/purchaseOrders';
import * as suppliersApi from '@/api/endpoints/suppliers';
import * as warehousesApi from '@/api/endpoints/warehouses';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import type { PurchaseOrderDto } from '@/types/domain';
import { PurchaseOrderForm, type PurchaseOrderSubmitValues } from './PurchaseOrderForm';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { PURCHASE_ORDER_STATUS_LABEL, PURCHASE_ORDER_STATUS_TONE } from './labels';
import { PurchasesTabs } from './PurchasesTabs';
import styles from './PurchasesPage.module.css';

const PAGE_SIZE = 20;

export function PurchasesPage() {
  const { has } = usePermissions();
  const { currentStore } = useStoreBranch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<PurchaseOrderDto | null>(null);

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers-all'], queryFn: suppliersApi.listAllSuppliers });
  const supplierNameById = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', currentStore?.id],
    queryFn: () => warehousesApi.listAllWarehouses(currentStore!.id),
    enabled: Boolean(currentStore),
  });
  const warehouseNameById = useMemo(() => new Map(warehouses.map((w) => [w.id, w.name])), [warehouses]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchase-orders', pageNumber],
    queryFn: () => purchaseOrdersApi.listPurchaseOrders({ pageNumber, pageSize: PAGE_SIZE }),
  });

  // GET /api/purchase-orders не поддерживает фильтр по статусу на бэкенде (только supplierId) —
  // фильтруем в рамках уже загруженной страницы.
  const visibleItems = (page?.items ?? []).filter((o) => !status || String(o.status) === status);

  const createMutation = useMutation({
    mutationFn: (values: PurchaseOrderSubmitValues) =>
      purchaseOrdersApi.createPurchaseOrder({
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        expectedDate: values.expectedDate || undefined,
        items: values.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setCreating(false);
    },
  });

  // Отдельного Purchases.* права в каталоге нет — зона гейтится Inventory.Read/Create/Approve.
  const canCreate = has('Inventory.Create');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader
        title="Закупки"
        subtitle="Заказы поставщикам, история закупок и задолженность"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Новый заказ
            </Button>
          )
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.statusSelect}>
          <Select label="Статус (на этой странице)" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Все статусы</option>
            {Object.entries(PURCHASE_ORDER_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && visibleItems.length === 0 && <EmptyState message="Заказов пока нет." />}

      {!isLoading && !isError && page && visibleItems.length > 0 && (
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
              {visibleItems.map((order) => (
                <tr key={order.id}>
                  <Td className="font-data">{order.orderNumber}</Td>
                  <Td>{supplierNameById.get(order.supplierId) ?? '—'}</Td>
                  <Td>{warehouseNameById.get(order.warehouseId) ?? '—'}</Td>
                  <Td className="font-data">{formatDate(order.orderDate)}</Td>
                  <Td>
                    <Badge tone={PURCHASE_ORDER_STATUS_TONE[order.status]}>
                      {PURCHASE_ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </Td>
                  <Td numeric>{formatMoney(order.totalAmount)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => setViewing(order)}>
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
          storeId={currentStore?.id}
          onSubmit={(values) => createMutation.mutate(values)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <PurchaseOrderDetailModal
        order={viewing}
        supplierName={viewing ? supplierNameById.get(viewing.supplierId) : undefined}
        warehouseName={viewing ? warehouseNameById.get(viewing.warehouseId) : undefined}
        onClose={() => setViewing(null)}
        onReceive={(order) => navigate(`/purchases/receiving?orderId=${order.id}`)}
        onUpdated={setViewing}
      />
    </div>
  );
}
