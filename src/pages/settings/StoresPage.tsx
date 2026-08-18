import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, EmptyState, ErrorState, Loader, Modal, PageHeader } from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as storesApi from '@/api/endpoints/stores';
import { extractErrorMessage } from '@/api/client';
import type { BranchFormValues, StoreFormValues } from '@/lib/validation/stores';
import type { BranchDto, StoreDto } from '@/types/domain';
import { StoreForm } from './StoreForm';
import { BranchForm } from './BranchForm';
import { STORE_STATUS_LABEL, STORE_STATUS_TONE } from './labels';
import styles from './StoresPage.module.css';

export function StoresPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [editingStore, setEditingStore] = useState<StoreDto | null>(null);
  const [creatingStore, setCreatingStore] = useState(false);
  const [branchTarget, setBranchTarget] = useState<{ storeId: string; branch: BranchDto | null } | null>(null);

  const { data: stores, isLoading, isError, refetch } = useQuery({ queryKey: ['stores'], queryFn: storesApi.listStores });

  const isStoreModalOpen = creatingStore || editingStore !== null;

  function closeStoreModal() {
    setCreatingStore(false);
    setEditingStore(null);
  }

  const saveStoreMutation = useMutation({
    mutationFn: async (values: StoreFormValues) => {
      const payload = {
        name: values.name,
        logoUrl: values.logoUrl || undefined,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        currency: values.currency,
        defaultTaxRate: values.defaultTaxRate,
        openingHours: values.openingHours || undefined,
      };
      if (editingStore) {
        return storesApi.updateStore(editingStore.id, { ...payload, status: values.status as StoreDto['status'] });
      }
      return storesApi.createStore(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      closeStoreModal();
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => storesApi.deleteStore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  function handleDeleteStore(store: StoreDto) {
    if (window.confirm(`Удалить магазин «${store.name}»? Все филиалы также будут удалены.`)) {
      deleteStoreMutation.mutate(store.id);
    }
  }

  const saveBranchMutation = useMutation({
    mutationFn: async (values: BranchFormValues) => {
      if (!branchTarget) throw new Error('no target');
      const payload = { name: values.name, address: values.address || undefined, phone: values.phone || undefined };
      if (branchTarget.branch) {
        return storesApi.updateBranch(branchTarget.storeId, branchTarget.branch.id, {
          ...payload,
          status: values.status as BranchDto['status'],
        });
      }
      return storesApi.createBranch(branchTarget.storeId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setBranchTarget(null);
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: ({ storeId, branchId }: { storeId: string; branchId: string }) =>
      storesApi.deleteBranch(storeId, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  function handleDeleteBranch(storeId: string, branch: BranchDto) {
    if (window.confirm(`Удалить филиал «${branch.name}»?`)) {
      deleteBranchMutation.mutate({ storeId, branchId: branch.id });
    }
  }

  const canCreate = has('Stores.Create');
  const canUpdate = has('Stores.Update');
  const canDelete = has('Stores.Delete');

  return (
    <div>
      <PageHeader
        title="Магазины"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreatingStore(true)}>
              <PlusIcon width={16} height={16} />
              Добавить магазин
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && stores && stores.length === 0 && <EmptyState message="Магазинов пока нет." />}

      {!isLoading && !isError && stores && stores.length > 0 && (
        <div className={styles.list}>
          {stores.map((store) => (
            <Card key={store.id}>
              <div className={styles.storeHeader}>
                <div>
                  <h3 className={styles.storeName}>{store.name}</h3>
                  <div className={styles.meta}>
                    {store.address && <span>{store.address}</span>}
                    {store.phone && <span className="font-data">{store.phone}</span>}
                    {store.email && <span>{store.email}</span>}
                    <span className="font-data">{store.currency}</span>
                  </div>
                </div>
                <div className={styles.storeHeaderRight}>
                  <Badge tone={STORE_STATUS_TONE[store.status]}>{STORE_STATUS_LABEL[store.status]}</Badge>
                  {canUpdate && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingStore(store)} aria-label="Изменить">
                      <EditIcon width={15} height={15} />
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteStore(store)} aria-label="Удалить">
                      <TrashIcon width={15} height={15} />
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.branches}>
                <div className={styles.branchesHeading}>
                  <span className={styles.branchesTitle}>Филиалы</span>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBranchTarget({ storeId: store.id, branch: null })}
                    >
                      <PlusIcon width={14} height={14} />
                      Добавить филиал
                    </Button>
                  )}
                </div>
                {store.branches.length === 0 && (
                  <span className={styles.branchMeta}>Филиалов пока нет.</span>
                )}
                {store.branches.map((branch) => (
                  <div key={branch.id} className={styles.branchRow}>
                    <span className={styles.branchName}>{branch.name}</span>
                    <span className={styles.branchMeta}>{branch.address ?? ''}</span>
                    <Badge tone={STORE_STATUS_TONE[branch.status]}>{STORE_STATUS_LABEL[branch.status]}</Badge>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBranchTarget({ storeId: store.id, branch })}
                        aria-label="Изменить филиал"
                      >
                        <EditIcon width={14} height={14} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBranch(store.id, branch)}
                        aria-label="Удалить филиал"
                      >
                        <TrashIcon width={14} height={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={isStoreModalOpen} onClose={closeStoreModal} title={editingStore ? 'Изменить магазин' : 'Новый магазин'}>
        <StoreForm
          store={editingStore}
          onSubmit={(values) => saveStoreMutation.mutate(values)}
          onCancel={closeStoreModal}
          isSaving={saveStoreMutation.isPending}
          serverError={saveStoreMutation.error ? extractErrorMessage(saveStoreMutation.error) : null}
        />
      </Modal>

      <Modal
        open={branchTarget !== null}
        onClose={() => setBranchTarget(null)}
        title={branchTarget?.branch ? 'Изменить филиал' : 'Новый филиал'}
      >
        <BranchForm
          branch={branchTarget?.branch ?? null}
          onSubmit={(values) => saveBranchMutation.mutate(values)}
          onCancel={() => setBranchTarget(null)}
          isSaving={saveBranchMutation.isPending}
          serverError={saveBranchMutation.error ? extractErrorMessage(saveBranchMutation.error) : null}
        />
      </Modal>
    </div>
  );
}
