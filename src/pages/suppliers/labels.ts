import { SupplierStatus } from '@/types/domain';

export const SUPPLIER_STATUS_LABEL: Record<number, string> = {
  [SupplierStatus.Active]: 'Активен',
  [SupplierStatus.Inactive]: 'Неактивен',
};

export const SUPPLIER_STATUS_TONE: Record<number, 'good' | 'neutral'> = {
  [SupplierStatus.Active]: 'good',
  [SupplierStatus.Inactive]: 'neutral',
};
