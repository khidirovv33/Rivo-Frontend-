import { ProductStatus } from '@/types/domain';

export const PRODUCT_STATUS_LABEL: Record<number, string> = {
  [ProductStatus.Active]: 'Активен',
  [ProductStatus.Inactive]: 'Неактивен',
  [ProductStatus.Discontinued]: 'Снят с продажи',
};

export const PRODUCT_STATUS_TONE: Record<number, 'good' | 'neutral' | 'critical'> = {
  [ProductStatus.Active]: 'good',
  [ProductStatus.Inactive]: 'neutral',
  [ProductStatus.Discontinued]: 'critical',
};
