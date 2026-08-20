import { PurchaseOrderStatus, ReceivingStatus } from '@/types/domain';

export const PURCHASE_ORDER_STATUS_LABEL: Record<number, string> = {
  [PurchaseOrderStatus.Draft]: 'Черновик',
  [PurchaseOrderStatus.Sent]: 'Отправлен',
  [PurchaseOrderStatus.Confirmed]: 'Подтверждён',
  [PurchaseOrderStatus.PartiallyReceived]: 'Частично получен',
  [PurchaseOrderStatus.Received]: 'Получен',
  [PurchaseOrderStatus.Cancelled]: 'Отменён',
};

export const PURCHASE_ORDER_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [PurchaseOrderStatus.Draft]: 'neutral',
  [PurchaseOrderStatus.Sent]: 'warn',
  [PurchaseOrderStatus.Confirmed]: 'warn',
  [PurchaseOrderStatus.PartiallyReceived]: 'warn',
  [PurchaseOrderStatus.Received]: 'good',
  [PurchaseOrderStatus.Cancelled]: 'critical',
};

export const RECEIVING_STATUS_LABEL: Record<number, string> = {
  [ReceivingStatus.Draft]: 'Черновик',
  [ReceivingStatus.Completed]: 'Завершена',
  [ReceivingStatus.Cancelled]: 'Отменена',
};

export const RECEIVING_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [ReceivingStatus.Draft]: 'neutral',
  [ReceivingStatus.Completed]: 'good',
  [ReceivingStatus.Cancelled]: 'critical',
};
