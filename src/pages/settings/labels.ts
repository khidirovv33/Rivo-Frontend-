import { StoreStatus } from '@/types/domain';

export const STORE_STATUS_LABEL: Record<number, string> = {
  [StoreStatus.Active]: 'Активен',
  [StoreStatus.Inactive]: 'Неактивен',
};

export const STORE_STATUS_TONE: Record<number, 'good' | 'neutral'> = {
  [StoreStatus.Active]: 'good',
  [StoreStatus.Inactive]: 'neutral',
};
