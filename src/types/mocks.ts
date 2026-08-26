// Типы для зоны Dev3 (Finance & Intelligence), у которой пока нет backend-контроллеров
// (Rivo.API/Controllers/{Finance,Income,Expenses,Accounts,Analytics,Reports,Notifications,Audit}Controller.cs
// существуют как пустые файлы-заглушки). В отличие от domain.ts, это НЕ зеркало реального DTO —
// это форма, в которой данные должны прийти, когда backend появится (см. src/mocks/*.ts,
// помечено `// MOCK`). Когда backend будет готов — сверить эти типы с реальными DTO и, при
// необходимости, перенести в domain.ts.

// ---- Finance: счета, доходы/расходы ----

export const AccountType = { Cash: 1, Bank: 2, Card: 3 } as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export const FinanceEntryKind = { Income: 1, Expense: 2 } as const;
export type FinanceEntryKind = (typeof FinanceEntryKind)[keyof typeof FinanceEntryKind];

export interface FinanceEntryDto {
  id: string;
  kind: FinanceEntryKind;
  date: string;
  amount: number;
  category: string;
  accountId: string;
  accountName: string;
  description: string | null;
}

export interface CreateFinanceEntryRequest {
  kind: FinanceEntryKind;
  date: string;
  amount: number;
  category: string;
  accountId: string;
  description?: string;
}

// ---- Finance: прибыль ----

export interface ProfitSummaryDto {
  periodLabel: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export interface ProfitTrendPointDto {
  periodLabel: string;
  revenue: number;
  netProfit: number;
}

// ---- Analytics ----

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface AnalyticsTrendPointDto {
  date: string;
  sales: number;
  profit: number;
}

export interface ProductPerformanceDto {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface DeadStockItemDto {
  productId: string;
  productName: string;
  daysSinceLastSale: number;
  stockQuantity: number;
}

export interface EmployeeStatDto {
  userId: string;
  fullName: string;
  salesCount: number;
  salesTotal: number;
  averageCheck: number;
}

export interface BranchComparisonDto {
  branchId: string;
  branchName: string;
  sales: number;
  ordersCount: number;
  averageCheck: number;
}

export interface AnalyticsOverviewDto {
  trend: AnalyticsTrendPointDto[];
  bestSellers: ProductPerformanceDto[];
  mostProfitable: ProductPerformanceDto[];
  slowMoving: DeadStockItemDto[];
  deadStock: DeadStockItemDto[];
  employeeStats: EmployeeStatDto[];
  branchComparison: BranchComparisonDto[];
}

// ---- Audit log ----

export interface AuditLogEntryDto {
  id: string;
  occurredAt: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string;
}

// ---- Notifications ----

export const NotificationType = {
  LowStock: 1,
  BigShortage: 2,
  NewPurchase: 3,
  PriceChange: 4,
  Finance: 5,
  Suspicious: 6,
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
