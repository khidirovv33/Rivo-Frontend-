import { AccountType, FinanceEntryKind } from '@/types/mocks';

export const ACCOUNT_TYPE_LABEL: Record<number, string> = {
  [AccountType.Cash]: 'Касса',
  [AccountType.Bank]: 'Банк',
  [AccountType.Card]: 'Карта',
};

export const FINANCE_ENTRY_KIND_LABEL: Record<number, string> = {
  [FinanceEntryKind.Income]: 'Доход',
  [FinanceEntryKind.Expense]: 'Расход',
};

export const INCOME_CATEGORIES = ['Продажи', 'Возврат от поставщика', 'Прочие доходы'];
export const EXPENSE_CATEGORIES = [
  'Аренда',
  'Зарплата',
  'Закупка товара',
  'Коммунальные услуги',
  'Логистика',
  'Прочее',
];
