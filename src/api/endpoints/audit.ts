// MOCK: заменить на реальный вызов GET /api/audit, когда у AuditController появится публичный
// эндпоинт чтения (сама таблица AuditLog бэкенд уже пишет) — сигнатуру не менять.
import * as mock from '@/mocks/audit';
import type { AuditLogEntryDto } from '@/types/mocks';

export async function listAuditLog(): Promise<AuditLogEntryDto[]> {
  return mock.getAuditLogMock();
}
