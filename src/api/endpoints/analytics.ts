// MOCK: заменить на реальный вызов GET /api/analytics, когда backend Dev3 будет готов —
// сигнатуру не менять, чтобы страницу не трогать.
import * as mock from '@/mocks/analytics';
import type { AnalyticsOverviewDto, AnalyticsPeriod } from '@/types/mocks';

export async function getAnalyticsOverview(period: AnalyticsPeriod): Promise<AnalyticsOverviewDto> {
  return mock.getAnalyticsOverviewMock(period);
}
