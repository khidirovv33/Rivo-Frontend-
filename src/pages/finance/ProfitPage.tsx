import { useQuery } from '@tanstack/react-query';
import { Card, ErrorState, Loader, PageHeader } from '@/components';
import * as financeApi from '@/api/endpoints/finance';
import { formatMoney } from '@/lib/format';
import { ProfitTrendChart } from './ProfitTrendChart';
import styles from './ProfitPage.module.css';

export function ProfitPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({ queryKey: ['profit-summary'], queryFn: financeApi.getProfitSummary });

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['profit-trend'],
    queryFn: financeApi.getProfitTrend,
  });

  return (
    <div>
      <PageHeader title="Прибыль" subtitle={summary?.periodLabel} />

      {summaryLoading && <Loader />}
      {summaryError && <ErrorState onRetry={() => refetchSummary()} />}

      {summary && (
        <div className={styles.grid}>
          <Card>
            <div className={styles.breakdown}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Выручка</span>
                <span className="font-data">{formatMoney(summary.revenue)}</span>
              </div>
              <div className={[styles.row, styles.rowMinus].join(' ')}>
                <span className={styles.rowLabel}>Себестоимость (COGS)</span>
                <span className={['font-data', styles.rowValue].join(' ')}>{formatMoney(summary.cogs)}</span>
              </div>
              <div className={[styles.row, styles.subtotal].join(' ')}>
                <span>Валовая прибыль</span>
                <span className="font-data">{formatMoney(summary.grossProfit)}</span>
              </div>
              <div className={[styles.row, styles.rowMinus].join(' ')}>
                <span className={styles.rowLabel}>Расходы</span>
                <span className={['font-data', styles.rowValue].join(' ')}>{formatMoney(summary.expenses)}</span>
              </div>
              <div className={[styles.row, styles.final].join(' ')}>
                <span>Чистая прибыль</span>
                <span className="font-data">{formatMoney(summary.netProfit)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className={styles.chartTitle}>Динамика за полгода</h2>
            {trendLoading && <Loader />}
            {trend && <ProfitTrendChart points={trend} />}
          </Card>
        </div>
      )}
    </div>
  );
}
