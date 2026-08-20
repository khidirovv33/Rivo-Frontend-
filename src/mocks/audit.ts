// MOCK: backend Dev3 (Audit) ещё не реализован — Rivo.API/Controllers/AuditController.cs пустой,
// хотя сам журнал (таблица AuditLog) бэкенд уже пишет автоматически через интерцептор при каждом
// изменении (см. Rivo.Infrastructure) — публичного GET-эндпоинта для чтения пока просто нет.
// Заменить только api/endpoints/audit.ts, когда эндпоинт появится.

import type { AuditLogEntryDto } from '@/types/mocks';

function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const entries: AuditLogEntryDto[] = [
  { id: 'a1', occurredAt: '2026-08-19T14:32:10Z', userName: 'Дилноза Каримова', action: 'Изменил(а)', entityType: 'Product', entityId: 'COLA-05', oldValue: 'sellingPrice: 14000', newValue: 'sellingPrice: 15000', ipAddress: '84.54.12.10' },
  { id: 'a2', occurredAt: '2026-08-19T11:05:44Z', userName: 'Азиз Норов', action: 'Создал(а)', entityType: 'Order', entityId: 'POS-20260819110544', oldValue: null, newValue: 'totalAmount: 52900', ipAddress: '84.54.12.11' },
  { id: 'a3', occurredAt: '2026-08-18T18:47:02Z', userName: 'Дилноза Каримова', action: 'Заблокировал(а)', entityType: 'User', entityId: 'sardor@rivo.uz', oldValue: 'status: Active', newValue: 'status: Blocked', ipAddress: '84.54.12.10' },
  { id: 'a4', occurredAt: '2026-08-18T09:12:37Z', userName: 'Севара Юсупова', action: 'Оформил(а) возврат', entityType: 'Return', entityId: 'RET-2026-0042', oldValue: null, newValue: 'totalRefundAmount: 16800', ipAddress: '84.54.12.14' },
  { id: 'a5', occurredAt: '2026-08-17T16:20:19Z', userName: 'Дилноза Каримова', action: 'Изменил(а)', entityType: 'Role', entityId: 'Cashier', oldValue: 'permissions: [Sales.Read]', newValue: 'permissions: [Sales.Read, Sales.Create]', ipAddress: '84.54.12.10' },
  { id: 'a6', occurredAt: '2026-08-17T10:03:51Z', userName: 'Азиз Норов', action: 'Создал(а)', entityType: 'Customer', entityId: 'Азиз Норов (клиент)', oldValue: null, newValue: 'fullName: Тимур Абдуллаев', ipAddress: '84.54.12.11' },
];

export function getAuditLogMock(): Promise<AuditLogEntryDto[]> {
  return delay([...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
}
