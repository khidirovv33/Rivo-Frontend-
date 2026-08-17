import { useContext } from 'react';
import { StoreBranchContext } from './StoreBranchContext';

export function useStoreBranch() {
  const ctx = useContext(StoreBranchContext);
  if (!ctx) {
    throw new Error('useStoreBranch must be used within StoreBranchProvider');
  }
  return ctx;
}
