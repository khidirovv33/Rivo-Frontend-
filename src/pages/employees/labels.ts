import { UserStatus } from '@/types/domain';

export const USER_STATUS_LABEL: Record<number, string> = {
  [UserStatus.PendingVerification]: 'Ожидает подтверждения',
  [UserStatus.Active]: 'Активен',
  [UserStatus.Blocked]: 'Заблокирован',
};

export const USER_STATUS_TONE: Record<number, 'good' | 'neutral' | 'critical'> = {
  [UserStatus.PendingVerification]: 'neutral',
  [UserStatus.Active]: 'good',
  [UserStatus.Blocked]: 'critical',
};
