import { TransferStatus } from '@/types/domain';

export const TRANSFER_STATUS_LABEL: Record<number, string> = {
  [TransferStatus.Draft]: 'Черновик',
  [TransferStatus.Pending]: 'Ожидает',
  [TransferStatus.Approved]: 'Одобрено',
  [TransferStatus.Shipped]: 'Отправлено',
  [TransferStatus.Received]: 'Получено',
  [TransferStatus.Cancelled]: 'Отменено',
};

export const TRANSFER_STATUS_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [TransferStatus.Draft]: 'neutral',
  [TransferStatus.Pending]: 'warn',
  [TransferStatus.Approved]: 'warn',
  [TransferStatus.Shipped]: 'warn',
  [TransferStatus.Received]: 'good',
  [TransferStatus.Cancelled]: 'critical',
};
