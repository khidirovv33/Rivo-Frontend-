import { OrderStatus, PaymentMethod, ReturnStatus } from '@/types/domain';

export const PAYMENT_METHOD_LABEL: Record<number, string> = {
  [PaymentMethod.Cash]: 'Наличные',
  [PaymentMethod.Card]: 'Карта',
  [PaymentMethod.Other]: 'Другое',
};

export const ORDER_STATUS_LABEL: Record<number, string> = {
  [OrderStatus.Completed]: 'Оплачен',
  [OrderStatus.PartiallyRefunded]: 'Частичный возврат',
  [OrderStatus.Refunded]: 'Возврат',
  [OrderStatus.Voided]: 'Отменён',
};

export const ORDER_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [OrderStatus.Completed]: 'good',
  [OrderStatus.PartiallyRefunded]: 'warn',
  [OrderStatus.Refunded]: 'critical',
  [OrderStatus.Voided]: 'neutral',
};

export const RETURN_STATUS_LABEL: Record<number, string> = {
  [ReturnStatus.Completed]: 'Выполнен',
  [ReturnStatus.PartiallyCompleted]: 'Частично выполнен',
  [ReturnStatus.Rejected]: 'Отклонён',
};

export const RETURN_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical'> = {
  [ReturnStatus.Completed]: 'good',
  [ReturnStatus.PartiallyCompleted]: 'warn',
  [ReturnStatus.Rejected]: 'critical',
};
