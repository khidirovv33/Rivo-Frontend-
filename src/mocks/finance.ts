// MOCK: backend Dev3 (Finance) ещё не реализован — Rivo.API/Controllers/{Finance,Income,
// Expenses,Accounts}Controller.cs пустые. Форма данных здесь — та, в которой их должен будет
// отдавать реальный API (ApiResponse<T>/PaginatedList<T> оборачивание — на уровне api/endpoints,
// не здесь). Когда backend появится — заменить только функции в api/endpoints/finance.ts.

import type {
  AccountDto,
  CreateFinanceEntryRequest,
  FinanceEntryDto,
  ProfitSummaryDto,
  ProfitTrendPointDto,
} from '@/types/mocks';

function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const accounts: AccountDto[] = [
  { id: 'acc-cash', name: 'Касса магазина', type: 1, balance: 4_820_000 },
  { id: 'acc-bank', name: 'Расчётный счёт', type: 2, balance: 38_450_000 },
  { id: 'acc-card', name: 'Эквайринг (карта)', type: 3, balance: 6_120_000 },
];

const entries: FinanceEntryDto[] = [
  { id: 'fe-1', kind: 1, date: '2026-08-19', amount: 4_850_000, category: 'Продажи', accountId: 'acc-cash', accountName: 'Касса магазина', description: 'Выручка за день' },
  { id: 'fe-2', kind: 1, date: '2026-08-18', amount: 6_120_000, category: 'Продажи', accountId: 'acc-card', accountName: 'Эквайринг (карта)', description: 'Выручка за день' },
  { id: 'fe-3', kind: 2, date: '2026-08-18', amount: 2_400_000, category: 'Аренда', accountId: 'acc-bank', accountName: 'Расчётный счёт', description: 'Аренда помещения, август' },
  { id: 'fe-4', kind: 2, date: '2026-08-17', amount: 850_000, category: 'Зарплата', accountId: 'acc-bank', accountName: 'Расчётный счёт', description: 'Аванс — кассир' },
  { id: 'fe-5', kind: 2, date: '2026-08-16', amount: 320_000, category: 'Коммунальные услуги', accountId: 'acc-cash', accountName: 'Касса магазина', description: 'Электричество' },
  { id: 'fe-6', kind: 1, date: '2026-08-16', amount: 5_230_000, category: 'Продажи', accountId: 'acc-cash', accountName: 'Касса магазина', description: 'Выручка за день' },
  { id: 'fe-7', kind: 2, date: '2026-08-15', amount: 1_100_000, category: 'Закупка товара', accountId: 'acc-bank', accountName: 'Расчётный счёт', description: 'Поставщик «Nestle Tajikistan»' },
  { id: 'fe-8', kind: 2, date: '2026-08-14', amount: 180_000, category: 'Прочее', accountId: 'acc-cash', accountName: 'Касса магазина', description: 'Хознужды' },
];

export function getAccountsMock(): Promise<AccountDto[]> {
  return delay(accounts);
}

export function getFinanceEntriesMock(): Promise<FinanceEntryDto[]> {
  return delay([...entries].sort((a, b) => b.date.localeCompare(a.date)));
}

export function createFinanceEntryMock(entry: CreateFinanceEntryRequest): Promise<FinanceEntryDto> {
  const account = accounts.find((a) => a.id === entry.accountId);
  const created: FinanceEntryDto = {
    ...entry,
    description: entry.description ?? null,
    id: `fe-${Date.now()}`,
    accountName: account?.name ?? '—',
  };
  entries.unshift(created);
  if (account) {
    account.balance += entry.kind === 1 ? entry.amount : -entry.amount;
  }
  return delay(created);
}

const profitSummary: ProfitSummaryDto = {
  periodLabel: 'Август 2026',
  revenue: 128_400_000,
  cogs: 79_200_000,
  grossProfit: 49_200_000,
  expenses: 18_650_000,
  netProfit: 30_550_000,
};

const profitTrend: ProfitTrendPointDto[] = [
  { periodLabel: 'Мар', revenue: 96_000_000, netProfit: 21_400_000 },
  { periodLabel: 'Апр', revenue: 101_500_000, netProfit: 23_100_000 },
  { periodLabel: 'Май', revenue: 108_200_000, netProfit: 24_800_000 },
  { periodLabel: 'Июн', revenue: 112_900_000, netProfit: 26_300_000 },
  { periodLabel: 'Июл', revenue: 119_600_000, netProfit: 28_100_000 },
  { periodLabel: 'Авг', revenue: 128_400_000, netProfit: 30_550_000 },
];

export function getProfitSummaryMock(): Promise<ProfitSummaryDto> {
  return delay(profitSummary);
}

export function getProfitTrendMock(): Promise<ProfitTrendPointDto[]> {
  return delay(profitTrend);
}
