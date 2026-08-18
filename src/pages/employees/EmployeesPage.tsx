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
import * as usersApi from '@/api/endpoints/users';
import { extractErrorMessage } from '@/api/client';
import type { CreateUserFormValues, UpdateUserFormValues } from '@/lib/validation/users';
import { UserStatus, type UserDto } from '@/types/domain';
import { CreateEmployeeForm } from './CreateEmployeeForm';
import { EditEmployeeForm } from './EditEmployeeForm';
import { USER_STATUS_LABEL, USER_STATUS_TONE } from './labels';
import styles from './EmployeesPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function EmployeesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<UserDto | null>(null);
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
    queryKey: ['users', pageNumber, searchTerm],
    queryFn: () => usersApi.listUsers({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }

  const createMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      usersApi.createUser({ ...values, phoneNumber: values.phoneNumber || undefined }),
    onSuccess: () => {
      invalidate();
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateUserFormValues) =>
      usersApi.updateUser(editing!.id, {
        ...values,
        phoneNumber: values.phoneNumber || undefined,
        status: values.status as UserStatus,
      }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => usersApi.blockUser(id),
    onSuccess: invalidate,
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => usersApi.unblockUser(id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: invalidate,
  });

  function handleDelete(user: UserDto) {
    if (window.confirm(`Удалить сотрудника «${user.fullName}»?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  const canCreate = has('Users.Create');
  const canUpdate = has('Users.Update');
  const canDelete = has('Users.Delete');

  return (
    <div>
      <PageHeader
        title="Сотрудники"
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
            placeholder="Имя или email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && <EmptyState message="Сотрудников пока нет." />}

      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Имя</Th>
                <Th>Email</Th>
                <Th>Роль</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((user) => (
                <tr key={user.id}>
                  <Td>{user.fullName}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.roleName}</Td>
                  <Td>
                    <Badge tone={USER_STATUS_TONE[user.status]}>{USER_STATUS_LABEL[user.status]}</Badge>
                  </Td>
                  <Td>
                    <div className={formStyles.rowActions}>
                      {canUpdate && user.status === UserStatus.Blocked && (
                        <Button variant="ghost" size="sm" onClick={() => unblockMutation.mutate(user.id)}>
                          Разблокировать
                        </Button>
                      )}
                      {canUpdate && user.status !== UserStatus.Blocked && (
                        <Button variant="ghost" size="sm" onClick={() => blockMutation.mutate(user.id)}>
                          Заблокировать
                        </Button>
                      )}
                      {canUpdate && (
                        <Button variant="ghost" size="sm" onClick={() => setEditing(user)} aria-label="Изменить">
                          <EditIcon width={15} height={15} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} aria-label="Удалить">
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Новый сотрудник">
        <CreateEmployeeForm
          onSubmit={(values) => createMutation.mutate(values)}
          onCancel={() => setCreating(false)}
          isSaving={createMutation.isPending}
          serverError={createMutation.error ? extractErrorMessage(createMutation.error) : null}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Изменить сотрудника">
        {editing && (
          <EditEmployeeForm
            user={editing}
            onSubmit={(values) => updateMutation.mutate(values)}
            onCancel={() => setEditing(null)}
            isSaving={updateMutation.isPending}
            serverError={updateMutation.error ? extractErrorMessage(updateMutation.error) : null}
          />
        )}
      </Modal>
    </div>
  );
}
