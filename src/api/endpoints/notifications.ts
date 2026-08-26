// MOCK: заменить на реальные вызовы GET/POST /api/notifications, когда backend Dev3 будет
// готов — сигнатуры не менять.
import * as mock from '@/mocks/notifications';
import type { NotificationDto } from '@/types/mocks';

export async function listNotifications(): Promise<NotificationDto[]> {
  return mock.getNotificationsMock();
}

export async function markNotificationRead(id: string): Promise<void> {
  return mock.markNotificationReadMock(id);
}

export async function markAllNotificationsRead(): Promise<void> {
  return mock.markAllNotificationsReadMock();
}
