import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, EmptyState, ErrorState, Loader, PageHeader, StatCard } from '@/components';
import * as dashboardApi from '@/api/endpoints/dashboard';
import { formatMoney } from '@/lib/format';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { WeeklySalesChart } from './WeeklySalesChart';
import styles from './DashboardPage.module.css';

const DATE_LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-US', tg: 'tg-TJ' };

function formatTodayLabel(language: string): string {
  const locale = DATE_LOCALES[language.split('-')[0]] ?? 'ru-RU';
  const raw = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function trendFor(changePercent: number | null) {
  if (changePercent === null) return undefined;
  return {
    direction: (changePercent >= 0 ? 'up' : 'down') as 'up' | 'down',
    label: `${Math.abs(changePercent)}%`,
  };
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { currentBranch } = useStoreBranch();

  const {
    data: overview,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', currentBranch?.id],
    queryFn: () => dashboardApi.getOverview(currentBranch?.id),
  });

  return (
    <div>
      <PageHeader title={t('dashboard.title')} subtitle={formatTodayLabel(i18n.language)} />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && overview && (
        <>
          <div className={styles.statsGrid}>
            <StatCard
              label={t('dashboard.salesToday')}
              value={formatMoney(overview.salesToday)}
              trend={trendFor(overview.salesChangePercent)}
              sparkline={overview.weeklySales.map((p) => p.total)}
            />
            <StatCard
              label={t('dashboard.orders')}
              value={String(overview.ordersToday)}
              trend={trendFor(overview.ordersChangePercent)}
            />
            <StatCard
              label={t('dashboard.averageCheck')}
              value={formatMoney(overview.averageCheckToday)}
              trend={trendFor(overview.averageCheckChangePercent)}
            />
            <StatCard
              label={t('dashboard.lowStock')}
              value={`${overview.lowStockProductCount} ${t('dashboard.lowStockUnit')}`}
              tone={overview.lowStockProductCount > 0 ? 'critical' : 'default'}
              hint={
                overview.lowStockWarehouseCount > 0
                  ? t('dashboard.lowStockHint', { count: overview.lowStockWarehouseCount })
                  : undefined
              }
            />
          </div>

          <Card className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>{t('dashboard.weeklySales')}</h2>
              <span className={styles.chartUnit}>{t('dashboard.weeklySalesUnit')}</span>
            </div>
            <WeeklySalesChart points={overview.weeklySales} />
          </Card>

          <Card className={styles.topProductsCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>{t('dashboard.topProducts')}</h2>
              <span className={styles.chartUnit}>{t('dashboard.topProductsUnit')}</span>
            </div>

            {overview.topProducts.length === 0 ? (
              <EmptyState message={t('dashboard.noSalesToday')} />
            ) : (
              <ul className={styles.topProductsList}>
                {overview.topProducts.map((product, index) => (
                  <li key={product.productId} className={styles.topProductRow}>
                    <span className={styles.topProductRank}>{index + 1}</span>
                    <span className={styles.topProductName}>{product.productName}</span>
                    <span className={styles.topProductQty}>
                      {product.quantitySold} {t('dashboard.topProductsUnitShort')}
                    </span>
                    <span className={styles.topProductRevenue}>{formatMoney(product.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
