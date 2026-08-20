import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Pagination, Table, Td, TextField, Th } from '@/components';
import { usePermissions } from '@/auth/usePermissions';
import * as purchasesApi from '@/api/endpoints/purchases';
import { extractErrorMessage } from '@/api/client';
import { formatDate, formatMoney } from '@/lib/format';
import { useSuppliersLookup } from '@/lib/lookups';
import type { PurchaseDto } from '@/types/domain';
import { PurchasesTabs } from './PurchasesTabs';
import styles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function PurchasesInvoicesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [paying, setPaying] = useState<PurchaseDto | null>(null);
  const [amount, setAmount] = useState(0);
  const { nameOf: supplierName } = useSuppliersLookup();

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchases-invoices', pageNumber],
    queryFn: () => purchasesApi.listPurchases({ pageNumber, pageSize: PAGE_SIZE }),
  });

  const payMutation = useMutation({
    mutationFn: () => purchasesApi.recordPurchasePayment(paying!.id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setPaying(null);
      setAmount(0);
    },
  });

  const canPay = has('Inventory.Create');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader title="Оплаты поставщикам" />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Закупок пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Поставщик</Th>
                <Th>Дата</Th>
                <Th>Сумма</Th>
                <Th>Оплачено</Th>
                <Th>Остаток</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((purchase) => (
                <tr key={purchase.id}>
                  <Td>{supplierName(purchase.supplierId)}</Td>
                  <Td className="font-data">{formatDate(purchase.purchaseDate)}</Td>
                  <Td numeric className="font-data">{formatMoney(purchase.totalAmount)}</Td>
                  <Td numeric className="font-data">{formatMoney(purchase.paidAmount)}</Td>
                  <Td numeric className="font-data">
                    {purchase.outstandingAmount > 0 ? (
                      <Badge tone="critical">{formatMoney(purchase.outstandingAmount)}</Badge>
                    ) : (
                      <Badge tone="good">Оплачено</Badge>
                    )}
                  </Td>
                  <Td>
                    {canPay && purchase.outstandingAmount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPaying(purchase);
                          setAmount(purchase.outstandingAmount);
                        }}
                      >
                        Оплатить
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

      <Modal open={paying !== null} onClose={() => setPaying(null)} title="Оплата поставщику">
        {paying && (
          <div className={styles.form}>
            {payMutation.error && <div className={styles.error}>{extractErrorMessage(payMutation.error)}</div>}
            <p>
              Остаток долга: <strong className="font-data">{formatMoney(paying.outstandingAmount)}</strong>
            </p>
            <TextField
              label="Сумма оплаты"
              type="number"
              min={0}
              max={paying.outstandingAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            />
            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setPaying(null)}>
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={amount <= 0 || payMutation.isPending}
                onClick={() => payMutation.mutate()}
              >
                {payMutation.isPending ? 'Оплачиваем…' : 'Оплатить'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
