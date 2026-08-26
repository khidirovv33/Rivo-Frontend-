import { NotificationType } from '@/types/mocks';

export const NOTIFICATION_TYPE_LABEL: Record<number, string> = {
  [NotificationType.LowStock]: 'Мало на складе',
  [NotificationType.BigShortage]: 'Крупная недостача',
  [NotificationType.NewPurchase]: 'Новая закупка',
  [NotificationType.PriceChange]: 'Изменение цены',
  [NotificationType.Finance]: 'Финансы',
  [NotificationType.Suspicious]: 'Подозрительная активность',
};

export const NOTIFICATION_TYPE_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [NotificationType.LowStock]: 'warn',
  [NotificationType.BigShortage]: 'critical',
  [NotificationType.NewPurchase]: 'good',
  [NotificationType.PriceChange]: 'neutral',
  [NotificationType.Finance]: 'neutral',
  [NotificationType.Suspicious]: 'critical',
};
