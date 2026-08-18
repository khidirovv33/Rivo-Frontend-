import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
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
import * as suppliersApi from '@/api/endpoints/suppliers';
import { extractErrorMessage } from '@/api/client';
import type { SupplierFormValues } from '@/lib/validation/inventory';
import type { SupplierDto, SupplierStatus } from '@/types/domain';
import { SupplierForm } from './SupplierForm';
import { SUPPLIER_STATUS_LABEL, SUPPLIER_STATUS_TONE } from './labels';
import { PurchasesTabs } from '../purchases/PurchasesTabs';
import styles from './SuppliersPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function SuppliersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<SupplierDto | null>(null);
  const [creating, setCreating] = useState(false);

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
    queryKey: ['suppliers', pageNumber, searchTerm],
    queryFn: () => suppliersApi.listSuppliers({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  const isModalOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      const payload = {
        name: values.name,
        contactPerson: values.contactPerson || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
      };
      if (editing) {
        return suppliersApi.updateSupplier(editing.id, { ...payload, status: values.status as SupplierStatus });
      }
      return suppliersApi.createSupplier(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  function handleDelete(supplier: SupplierDto) {
    if (window.confirm(`Удалить поставщика «${supplier.name}»?`)) {
      deleteMutation.mutate(supplier.id);
    }
  }

  const canCreate = has('Suppliers.Create');
  const canUpdate = has('Suppliers.Update');
  const canDelete = has('Suppliers.Delete');

  return (
    <div>
      <PurchasesTabs />
      <PageHeader
        title="Поставщики"
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
            placeholder="Название, телефон или email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && (
        <EmptyState message="Поставщики не найдены." />
      )}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Название</Th>
                <Th>Контактное лицо</Th>
                <Th>Телефон</Th>
                <Th>Email</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((supplier) => (
                <tr key={supplier.id}>
                  <Td>{supplier.name}</Td>
                  <Td>{supplier.contactPerson ?? '—'}</Td>
                  <Td className="font-data">{supplier.phone ?? '—'}</Td>
                  <Td>{supplier.email ?? '—'}</Td>
                  <Td>
                    <Badge tone={SUPPLIER_STATUS_TONE[supplier.status]}>
                      {SUPPLIER_STATUS_LABEL[supplier.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <div className={formStyles.rowActions}>
                      {canUpdate && (
                        <Button variant="ghost" size="sm" onClick={() => setEditing(supplier)} aria-label="Изменить">
                          <EditIcon width={15} height={15} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier)} aria-label="Удалить">
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

      <Modal open={isModalOpen} onClose={closeModal} title={editing ? 'Изменить поставщика' : 'Новый поставщик'}>
        <SupplierForm
          supplier={editing}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
