// MOCK: backend Dev3 (Analytics) ещё не реализован — Rivo.API/Controllers/AnalyticsController.cs
// пустой. Заменить только api/endpoints/analytics.ts, когда появится реальный эндпоинт.

import type { AnalyticsOverviewDto, AnalyticsPeriod } from '@/types/mocks';

function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const bestSellers = [
  { productId: 'p1', productName: 'Кока-Кола 0.5л', quantitySold: 412, revenue: 6_180_000, profit: 2_060_000 },
  { productId: 'p2', productName: 'Хлеб «Ситный»', quantitySold: 380, revenue: 3_040_000, profit: 912_000 },
  { productId: 'p3', productName: 'Молоко 1л', quantitySold: 295, revenue: 3_687_500, profit: 885_000 },
  { productId: 'p4', productName: 'Чипсы Lays 150г', quantitySold: 210, revenue: 3_150_000, profit: 1_260_000 },
  { productId: 'p5', productName: 'Вода питьевая 1.5л', quantitySold: 340, revenue: 1_700_000, profit: 680_000 },
];

const mostProfitable = [...bestSellers].sort((a, b) => b.profit - a.profit);

const slowMoving = [
  { productId: 'p6', productName: 'Оливковое масло 1л', daysSinceLastSale: 18, stockQuantity: 14 },
  { productId: 'p7', productName: 'Чай зелёный листовой 200г', daysSinceLastSale: 22, stockQuantity: 9 },
];

const deadStock = [
  { productId: 'p8', productName: 'Новогодняя гирлянда 5м', daysSinceLastSale: 96, stockQuantity: 27 },
  { productId: 'p9', productName: 'Термос 1л (жёлтый)', daysSinceLastSale: 61, stockQuantity: 6 },
];

const employeeStats = [
  { userId: 'u1', fullName: 'Дилноза Каримова', salesCount: 184, salesTotal: 22_400_000, averageCheck: 121_739 },
  { userId: 'u2', fullName: 'Азиз Норов', salesCount: 156, salesTotal: 17_900_000, averageCheck: 114_744 },
  { userId: 'u3', fullName: 'Севара Юсупова', salesCount: 129, salesTotal: 14_100_000, averageCheck: 109_302 },
];

const branchComparison = [
  { branchId: 'b1', branchName: 'Филиал Чиланзар', sales: 68_400_000, ordersCount: 512, averageCheck: 133_594 },
  { branchId: 'b2', branchName: 'Филиал Юнусабад', sales: 60_000_000, ordersCount: 447, averageCheck: 134_228 },
];

function buildTrend(period: AnalyticsPeriod) {
  const lengths: Record<AnalyticsPeriod, number> = { day: 24, week: 7, month: 30, year: 12 };
  const length = lengths[period];
  const base = period === 'day' ? 300_000 : period === 'week' ? 4_000_000 : period === 'month' ? 4_200_000 : 95_000_000;
  return Array.from({ length }, (_, i) => {
    const wobble = 0.65 + Math.sin(i * 1.3) * 0.2 + Math.random() * 0.15;
    const sales = Math.round(base * wobble);
    return {
      date: period === 'year' ? `2026-${String(i + 1).padStart(2, '0')}` : `day-${i}`,
      sales,
      profit: Math.round(sales * 0.24),
    };
  });
}

export function getAnalyticsOverviewMock(period: AnalyticsPeriod): Promise<AnalyticsOverviewDto> {
  return delay({
    trend: buildTrend(period),
    bestSellers,
    mostProfitable,
    slowMoving,
    deadStock,
    employeeStats,
    branchComparison,
  });
}
