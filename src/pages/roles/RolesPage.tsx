import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal, PageHeader, Table, Td, Th } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as rolesApi from '@/api/endpoints/roles';
import { extractErrorMessage } from '@/api/client';
import type { RoleFormValues } from '@/lib/validation/roles';
import type { RoleDto } from '@/types/domain';
import { RoleForm } from './RoleForm';
import formStyles from '../_shared/CrudForm.module.css';

export function RolesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: roles, isLoading, isError, refetch } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.listRoles });

  const isOpen = creating || editing !== null;

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  const saveMutation = useMutation({
    mutationFn: async ({ values, permissionIds }: { values: RoleFormValues; permissionIds: string[] }) => {
      const payload = { name: values.name, description: values.description || undefined, permissionIds };
      if (editing) {
        return rolesApi.updateRole(editing.id, payload);
      }
      return rolesApi.createRole(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  function handleDelete(role: RoleDto) {
    if (window.confirm(`Удалить роль «${role.name}»?`)) {
      deleteMutation.mutate(role.id);
    }
  }

  const canCreate = has('Roles.Create');
  const canUpdate = has('Roles.Update');
  const canDelete = has('Roles.Delete');

  return (
    <div>
      <PageHeader
        title="Роли"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && roles && roles.length === 0 && <EmptyState message="Ролей пока нет." />}

      {!isLoading && !isError && roles && roles.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Описание</Th>
              <Th>Прав</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <Td>
                  {role.name}
                  {role.isSystemRole && (
                    <>
                      {' '}
                      <Badge tone="neutral">системная</Badge>
                    </>
                  )}
                </Td>
                <Td>{role.description ?? '—'}</Td>
                <Td numeric>{role.permissions.length}</Td>
                <Td>
                  <div className={formStyles.rowActions}>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(role)} aria-label="Изменить">
                        <EditIcon width={15} height={15} />
                      </Button>
                    )}
                    {canDelete && !role.isSystemRole && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(role)} aria-label="Удалить">
                        <TrashIcon width={15} height={15} />
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={isOpen} onClose={closeModal} title={editing ? 'Изменить роль' : 'Новая роль'}>
        <RoleForm
          role={editing}
          onSubmit={(values, permissionIds) => saveMutation.mutate({ values, permissionIds })}
          onCancel={closeModal}
          isSaving={saveMutation.isPending}
          serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
