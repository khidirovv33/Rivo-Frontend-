import { useQuery } from '@tanstack/react-query';
import { Card, EmptyState, ErrorState, Loader, PageHeader, StatCard } from '@/components';
import * as dashboardApi from '@/api/endpoints/dashboard';
import { formatMoney } from '@/lib/format';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import { WeeklySalesChart } from './WeeklySalesChart';
import styles from './DashboardPage.module.css';

function formatTodayLabel(): string {
  const raw = new Intl.DateTimeFormat('ru-RU', {
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
      <PageHeader title="Обзор" subtitle={formatTodayLabel()} />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && overview && (
        <>
          <div className={styles.statsGrid}>
            <StatCard
              label="Продажи сегодня"
              value={formatMoney(overview.salesToday)}
              trend={trendFor(overview.salesChangePercent)}
              sparkline={overview.weeklySales.map((p) => p.total)}
            />
            <StatCard
              label="Заказы"
              value={String(overview.ordersToday)}
              trend={trendFor(overview.ordersChangePercent)}
            />
            <StatCard
              label="Средний чек"
              value={formatMoney(overview.averageCheckToday)}
              trend={trendFor(overview.averageCheckChangePercent)}
            />
            <StatCard
              label="Товары заканчиваются"
              value={`${overview.lowStockProductCount} позиций`}
              tone={overview.lowStockProductCount > 0 ? 'critical' : 'default'}
              hint={overview.lowStockWarehouseCount > 0 ? `по ${overview.lowStockWarehouseCount} складам` : undefined}
            />
          </div>

          <Card className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Продажи за неделю</h2>
              <span className={styles.chartUnit}>сум, по дням</span>
            </div>
            <WeeklySalesChart points={overview.weeklySales} />
          </Card>

          <Card className={styles.topProductsCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Топ товаров</h2>
              <span className={styles.chartUnit}>шт. сегодня</span>
            </div>

            {overview.topProducts.length === 0 ? (
              <EmptyState message="Сегодня продаж пока не было." />
            ) : (
              <ul className={styles.topProductsList}>
                {overview.topProducts.map((product, index) => (
                  <li key={product.productId} className={styles.topProductRow}>
                    <span className={styles.topProductRank}>{index + 1}</span>
                    <span className={styles.topProductName}>{product.productName}</span>
                    <span className={styles.topProductQty}>{product.quantitySold} шт</span>
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
