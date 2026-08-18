import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@/components';
import * as permissionsApi from '@/api/endpoints/permissions';
import { roleSchema, type RoleFormValues } from '@/lib/validation/roles';
import type { RoleDto } from '@/types/domain';
import crudStyles from '../_shared/CrudForm.module.css';
import styles from './RoleForm.module.css';

interface RoleFormProps {
  role: RoleDto | null;
  onSubmit: (values: RoleFormValues, permissionIds: string[]) => void;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string | null;
}

export function RoleForm({ role, onSubmit, onCancel, isSaving, serverError }: RoleFormProps) {
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.listPermissions,
  });

  const initialSelected = useMemo(() => {
    if (!role) return new Set<string>();
    const namesAssigned = new Set(role.permissions);
    return new Set(permissions.filter((p) => namesAssigned.has(p.name)).map((p) => p.id));
  }, [role, permissions]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof permissions>();
    for (const permission of permissions) {
      const list = map.get(permission.module) ?? [];
      list.push(permission);
      map.set(permission.module, list);
    }
    return map;
  }, [permissions]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role?.name ?? '', description: role?.description ?? '' },
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form
      className={crudStyles.form}
      onSubmit={handleSubmit((values) => onSubmit(values, Array.from(selected)))}
      noValidate
    >
      {serverError && <div className={crudStyles.error}>{serverError}</div>}
      <TextField label="Название" disabled={role?.isSystemRole} error={errors.name?.message} {...register('name')} />
      <TextField label="Описание (необязательно)" error={errors.description?.message} {...register('description')} />

      <div className={styles.permissions}>
        {Array.from(grouped.entries()).map(([module, items]) => (
          <div key={module} className={styles.group}>
            <div className={styles.groupTitle}>{module}</div>
            {items.map((permission) => (
              <label key={permission.id} className={styles.checkboxRow}>
                <input type="checkbox" checked={selected.has(permission.id)} onChange={() => toggle(permission.id)} />
                {permission.action}
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className={crudStyles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}
