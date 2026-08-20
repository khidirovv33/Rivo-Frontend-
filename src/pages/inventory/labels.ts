import { InventoryStatus } from '@/types/domain';

export const INVENTORY_STATUS_LABEL: Record<number, string> = {
  [InventoryStatus.Draft]: 'В процессе',
  [InventoryStatus.Completed]: 'Завершена',
  [InventoryStatus.Approved]: 'Утверждена',
  [InventoryStatus.Cancelled]: 'Отменена',
};

export const INVENTORY_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [InventoryStatus.Draft]: 'warn',
  [InventoryStatus.Completed]: 'warn',
  [InventoryStatus.Approved]: 'good',
  [InventoryStatus.Cancelled]: 'critical',
};
