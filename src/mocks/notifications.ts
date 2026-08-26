// MOCK: backend Dev3 (Notifications) ещё не реализован — Rivo.API/Controllers/NotificationsController.cs
// пустой. Заменить только api/endpoints/notifications.ts, когда появится реальный эндпоинт.

import type { NotificationDto } from '@/types/mocks';

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let notifications: NotificationDto[] = [
  { id: 'n1', type: 1, title: 'Мало на складе', message: '«Оливковое масло 1л» — осталось 14 шт (мин. остаток 20).', createdAt: '2026-08-19T15:10:00Z', isRead: false },
  { id: 'n2', type: 2, title: 'Крупная недостача', message: 'Ревизия INV-2026-0031: недостача «Термос 1л (жёлтый)» — 6 шт.', createdAt: '2026-08-19T09:40:00Z', isRead: false },
  { id: 'n3', type: 3, title: 'Новая закупка', message: 'Приход по заказу PO-2026-0118 от «Nestle Tajikistan» подтверждён.', createdAt: '2026-08-18T13:05:00Z', isRead: true },
  { id: 'n4', type: 4, title: 'Изменение цены', message: 'Цена «Кока-Кола 0.5л» изменена: 14 000 → 15 000 сомони.', createdAt: '2026-08-18T10:22:00Z', isRead: true },
  { id: 'n5', type: 5, title: 'Финансовое событие', message: 'Расход «Аренда помещения» — 2 400 000 сомони списан со счёта «Расчётный счёт».', createdAt: '2026-08-18T08:00:00Z', isRead: true },
  { id: 'n6', type: 6, title: 'Подозрительная активность', message: 'Кассир Азиз Норов оформил 3 возврата подряд за 10 минут.', createdAt: '2026-08-17T19:47:00Z', isRead: false },
];

export function getNotificationsMock(): Promise<NotificationDto[]> {
  return delay([...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function markNotificationReadMock(id: string): Promise<void> {
  notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  return delay(undefined, 100);
}

export function markAllNotificationsReadMock(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, isRead: true }));
  return delay(undefined, 100);
}
