import { InventoryStatus } from '@/types/domain';

export const INVENTORY_STATUS_LABEL: Record<number, string> = {
  [InventoryStatus.InProgress]: 'В процессе',
  [InventoryStatus.Completed]: 'Завершена',
  [InventoryStatus.Cancelled]: 'Отменена',
};

export const INVENTORY_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [InventoryStatus.InProgress]: 'warn',
  [InventoryStatus.Completed]: 'good',
  [InventoryStatus.Cancelled]: 'critical',
};
