import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, EmptyState, ErrorState, Loader, Modal, PageHeader, StatCard, Table, Td, Th } from '@/components';
import { PlusIcon } from '@/components/icons';
import * as financeApi from '@/api/endpoints/finance';
import { formatDate, formatMoney } from '@/lib/format';
import type { FinanceEntryFormValues } from '@/lib/validation/finance';
import { FinanceEntryKind } from '@/types/mocks';
import { FinanceEntryForm } from './FinanceEntryForm';
import { ACCOUNT_TYPE_LABEL } from './labels';
import styles from './FinancePage.module.css';

export function FinancePage() {
  const queryClient = useQueryClient();
  const [addingKind, setAddingKind] = useState<FinanceEntryKind | null>(null);

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['finance-accounts'],
    queryFn: financeApi.listAccounts,
  });

  const {
    data: entries,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['finance-entries'],
    queryFn: financeApi.listFinanceEntries,
  });

  const createMutation = useMutation({
    mutationFn: (values: FinanceEntryFormValues) =>
      financeApi.createFinanceEntry({
        ...values,
        kind: values.kind as FinanceEntryKind,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      setAddingKind(null);
    },
  });

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Финансы"
        actions={
          <>
            <Button variant="secondary" onClick={() => setAddingKind(FinanceEntryKind.Income)}>
              <PlusIcon width={16} height={16} />
              Доход
            </Button>
            <Button variant="primary" onClick={() => setAddingKind(FinanceEntryKind.Expense)}>
              <PlusIcon width={16} height={16} />
              Расход
            </Button>
          </>
        }
      />

      {accountsLoading && <Loader />}
      {accounts && (
        <div className={styles.statsGrid}>
          <StatCard label="Все счета" value={formatMoney(totalBalance)} />
          {accounts.map((account) => (
            <StatCard key={account.id} label={ACCOUNT_TYPE_LABEL[account.type]} value={formatMoney(account.balance)} hint={account.name} />
          ))}
        </div>
      )}

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && entries && entries.length === 0 && (
        <EmptyState message="Операций пока нет." />
      )}
      {!isLoading && !isError && entries && entries.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Дата</Th>
              <Th>Категория</Th>
              <Th>Счёт</Th>
              <Th>Описание</Th>
              <Th>Сумма</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <Td className="font-data">{formatDate(entry.date)}</Td>
                <Td>{entry.category}</Td>
                <Td>{entry.accountName}</Td>
                <Td>{entry.description ?? '—'}</Td>
                <Td numeric className={entry.kind === FinanceEntryKind.Income ? styles.amountIncome : styles.amountExpense}>
                  {entry.kind === FinanceEntryKind.Income ? '+' : '-'}
                  {formatMoney(entry.amount)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={addingKind !== null}
        onClose={() => setAddingKind(null)}
        title={addingKind === FinanceEntryKind.Income ? 'Новый доход' : 'Новый расход'}
      >
        {addingKind !== null && accounts && (
          <FinanceEntryForm
            accounts={accounts}
            defaultKind={addingKind}
            onSubmit={(values) => createMutation.mutate(values)}
            onCancel={() => setAddingKind(null)}
            isSaving={createMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
