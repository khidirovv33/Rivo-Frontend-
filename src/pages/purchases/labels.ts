import { PurchaseOrderStatus } from '@/types/domain';

export const PURCHASE_ORDER_STATUS_LABEL: Record<number, string> = {
  [PurchaseOrderStatus.Draft]: 'Черновик',
  [PurchaseOrderStatus.Sent]: 'Отправлен',
  [PurchaseOrderStatus.PartiallyReceived]: 'Частично получен',
  [PurchaseOrderStatus.Received]: 'Получен',
  [PurchaseOrderStatus.Cancelled]: 'Отменён',
};

export const PURCHASE_ORDER_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [PurchaseOrderStatus.Draft]: 'neutral',
  [PurchaseOrderStatus.Sent]: 'warn',
  [PurchaseOrderStatus.PartiallyReceived]: 'warn',
  [PurchaseOrderStatus.Received]: 'good',
  [PurchaseOrderStatus.Cancelled]: 'critical',
};
