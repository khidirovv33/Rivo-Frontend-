import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  EmptyState,
  ErrorState,
  Loader,
  Modal,
  PageHeader,
  Pagination,
  Table,
  Td,
  TextField,
  Th,
} from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as customersApi from '@/api/endpoints/customers';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import type { CustomerFormValues } from '@/lib/validation/customers';
import type { CustomerDto } from '@/types/domain';
import { CustomerTabs } from './CustomerTabs';
import { CustomerForm } from './CustomerForm';
import { LoyaltyCardModal } from './LoyaltyCardModal';
import styles from './CustomersPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function CustomersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<CustomerDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [loyaltyTarget, setLoyaltyTarget] = useState<CustomerDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['customers', pageNumber, searchTerm],
    queryFn: () => customersApi.listCustomers({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  const isModalOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const payload = {
        fullName: values.fullName,
        phone: values.phone || undefined,
        email: values.email || undefined,
        birthDate: values.birthDate || undefined,
      };
      if (editing) {
        return customersApi.updateCustomer(editing.id, payload);
      }
      return customersApi.createCustomer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  function handleDelete(customer: CustomerDto) {
    if (window.confirm(`Удалить клиента «${customer.fullName}»?`)) {
      deleteMutation.mutate(customer.id);
    }
  }

  const canCreate = has('Customers.Create');
  const canUpdate = has('Customers.Update');
  const canDelete = has('Customers.Delete');
  const canSeeLoyalty = has('Loyalty.Read');

  return (
    <div>
      <CustomerTabs />
      <PageHeader
        title="Клиенты"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить
            </Button>
          )
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Имя, телефон или email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Клиенты не найдены." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Имя</Th>
                <Th>Телефон</Th>
                <Th>Email</Th>
                <Th>Покупок на сумму</Th>
                <Th>Баллы</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((customer) => (
                <tr key={customer.id}>
                  <Td>{customer.fullName}</Td>
                  <Td className="font-data">{customer.phone ?? '—'}</Td>
                  <Td>{customer.email ?? '—'}</Td>
                  <Td numeric>{formatMoney(customer.totalPurchasesAmount)}</Td>
                  <Td numeric>{customer.loyaltyPoints}</Td>
                  <Td>
                    <div className={formStyles.rowActions}>
                      {canSeeLoyalty && (
                        <Button variant="ghost" size="sm" onClick={() => setLoyaltyTarget(customer)}>
                          Карта
                        </Button>
                      )}
                      {canUpdate && (
                        <Button variant="ghost" size="sm" onClick={() => setEditing(customer)} aria-label="Изменить">
                          <EditIcon width={15} height={15} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(customer)} aria-label="Удалить">
                          <TrashIcon width={15} height={15} />
                        </Button>
                      )}
                    </div>
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

      <Modal open={isModalOpen} onClose={closeModal} title={editing ? 'Изменить клиента' : 'Новый клиент'}>
        <CustomerForm
          customer={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>

      <LoyaltyCardModal customer={loyaltyTarget} onClose={() => setLoyaltyTarget(null)} />
    </div>
  );
}
