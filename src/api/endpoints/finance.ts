// MOCK: заменить на реальные вызовы GET/POST /api/{finance,income,expenses,accounts}, когда
// backend Dev3 будет готов — сигнатуры функций не менять, чтобы страницы не трогать.
import * as mock from '@/mocks/finance';
import type {
  AccountDto,
  CreateFinanceEntryRequest,
  FinanceEntryDto,
  ProfitSummaryDto,
  ProfitTrendPointDto,
} from '@/types/mocks';

export async function listAccounts(): Promise<AccountDto[]> {
  return mock.getAccountsMock();
}

export async function listFinanceEntries(): Promise<FinanceEntryDto[]> {
  return mock.getFinanceEntriesMock();
}

export async function createFinanceEntry(payload: CreateFinanceEntryRequest): Promise<FinanceEntryDto> {
  return mock.createFinanceEntryMock(payload);
}

export async function getProfitSummary(): Promise<ProfitSummaryDto> {
  return mock.getProfitSummaryMock();
}

export async function getProfitTrend(): Promise<ProfitTrendPointDto[]> {
  return mock.getProfitTrendMock();
}
