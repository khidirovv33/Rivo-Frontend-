import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listStores } from '@/api/endpoints/stores';
import { useAuth } from '@/auth/useAuth';
import type { StoreDto } from '@/types/domain';

const STORAGE_KEY = 'rivo.currentBranch';

interface StoredSelection {
  storeId: string;
  branchId: string;
}

interface StoreBranchContextValue {
  stores: StoreDto[];
  isLoading: boolean;
  currentStore: StoreDto | null;
  currentBranch: StoreDto['branches'][number] | null;
  selectBranch: (storeId: string, branchId: string) => void;
}

export const StoreBranchContext = createContext<StoreBranchContextValue | null>(null);

function readStoredSelection(): StoredSelection | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSelection;
  } catch {
    return null;
  }
}

export function StoreBranchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selection, setSelection] = useState<StoredSelection | null>(readStoredSelection);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: listStores,
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (stores.length === 0) return;
    const stillValid = stores.some(
      (s) => s.id === selection?.storeId && s.branches.some((b) => b.id === selection?.branchId),
    );
    if (stillValid) return;
    const firstStore = stores[0];
    const firstBranch = firstStore.branches[0];
    if (firstStore && firstBranch) {
      setSelection({ storeId: firstStore.id, branchId: firstBranch.id });
    }
  }, [stores, selection]);

  const selectBranch = useCallback((storeId: string, branchId: string) => {
    setSelection({ storeId, branchId });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ storeId, branchId }));
  }, []);

  const currentStore = stores.find((s) => s.id === selection?.storeId) ?? null;
  const currentBranch = currentStore?.branches.find((b) => b.id === selection?.branchId) ?? null;

  const value = useMemo<StoreBranchContextValue>(
    () => ({ stores, isLoading, currentStore, currentBranch, selectBranch }),
    [stores, isLoading, currentStore, currentBranch, selectBranch],
  );

  return <StoreBranchContext.Provider value={value}>{children}</StoreBranchContext.Provider>;
}
