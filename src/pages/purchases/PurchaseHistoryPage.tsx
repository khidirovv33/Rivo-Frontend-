import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Select, Table, Td, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as purchasesApi from '@/api/endpoints/purchases';
import * as suppliersApi from '@/api/endpoints/suppliers';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import type { PurchaseDto } from '@/types/domain';
import type { RecordPaymentFormValues } from '@/lib/validation/inventory';
import { RecordPaymentForm } from './RecordPaymentForm';
import { PurchasesTabs } from './PurchasesTabs';
import styles from './PurchaseHistoryPage.module.css';

const PAGE_SIZE = 20;

export function PurchaseHistoryPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [supplierId, setSupplierId] = useState('');
  const [payingPurchase, setPayingPurchase] = useState<PurchaseDto | null>(null);

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers-all'], queryFn: suppliersApi.listAllSuppliers });
  const supplierNameById = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchases', pageNumber, supplierId],
    queryFn: () => purchasesApi.listPurchases({ pageNumber, pageSize: PAGE_SIZE, supplierId: supplierId || undefined }),
  });

  const paymentMutation = useMutation({
    mutationFn: (values: RecordPaymentFormValues) =>
      purchasesApi.recordPurchasePayment(payingPurchase!.id, { amount: values.amount, notes: values.notes || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setPayingPurchase(null);
    },
  });

  // Отдельного Purchases.* права в каталоге нет — зона гейтится Inventory.Read/Create/Approve.
  const canRecordPayment = has('Inventory.Create');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader title="История закупок" subtitle="Оплаты и задолженность по завершённым приёмкам" />

      <div className={styles.toolbar}>
        <div className={styles.supplierSelect}>
          <Select
            label="Поставщик"
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">Все поставщики</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Закупок пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Дата</Th>
                <Th>Поставщик</Th>
                <Th>Сумма</Th>
                <Th>Оплачено</Th>
                <Th>Задолженность</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((purchase) => (
                <tr key={purchase.id}>
                  <Td className="font-data">{formatDate(purchase.purchaseDate)}</Td>
                  <Td>{supplierNameById.get(purchase.supplierId) ?? '—'}</Td>
                  <Td numeric>{formatMoney(purchase.totalAmount)}</Td>
                  <Td numeric>{formatMoney(purchase.paidAmount)}</Td>
                  <Td numeric className={purchase.outstandingAmount > 0 ? styles.debt : undefined}>
                    {purchase.outstandingAmount > 0 ? (
                      <Badge tone="critical">{formatMoney(purchase.outstandingAmount)}</Badge>
                    ) : (
                      <Badge tone="good">Оплачено</Badge>
                    )}
                  </Td>
                  <Td>
                    {canRecordPayment && purchase.outstandingAmount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setPayingPurchase(purchase)}>
                        Записать оплату
                      </Button>
                    )}
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

      <Modal open={payingPurchase !== null} onClose={() => setPayingPurchase(null)} title="Оплата поставщику">
        {payingPurchase && (
          <RecordPaymentForm
            purchase={payingPurchase}
            onSubmit={(values) => paymentMutation.mutate(values)}
            onCancel={() => setPayingPurchase(null)}
            isSaving={paymentMutation.isPending}
            serverError={paymentMutation.error ? extractErrorMessage(paymentMutation.error) : null}
          />
        )}
      </Modal>
    </div>
  );
}
