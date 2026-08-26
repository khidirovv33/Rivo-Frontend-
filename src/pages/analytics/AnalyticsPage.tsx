import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, ErrorState, Loader, PageHeader, Table, Td, Th } from '@/components';
import * as analyticsApi from '@/api/endpoints/analytics';
import { formatMoney } from '@/lib/format';
import type { AnalyticsPeriod, AnalyticsTrendPointDto } from '@/types/mocks';
import { AnalyticsTrendChart } from './AnalyticsTrendChart';
import styles from './AnalyticsPage.module.css';

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
];

function labelForPoint(period: AnalyticsPeriod) {
  return (point: AnalyticsTrendPointDto, index: number) => {
    if (period === 'day') return `${index}:00`;
    if (period === 'week') return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][index % 7];
    if (period === 'year') {
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      return monthNames[index] ?? point.date;
    }
    return String(index + 1);
  };
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-overview', period],
    queryFn: () => analyticsApi.getAnalyticsOverview(period),
  });

  return (
    <div>
      <PageHeader title="Аналитика" />

      <div className={styles.periodTabs}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={[styles.periodTab, period === p.id ? styles.periodTabActive : ''].join(' ')}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <>
          <Card>
            <h2 className={styles.chartTitle}>Продажи и прибыль</h2>
            <AnalyticsTrendChart points={data.trend} labelFor={labelForPoint(period)} />
          </Card>

          <div className={styles.twoCol}>
            <Card>
              <h2 className={styles.sectionTitle}>Лидеры продаж</h2>
              {data.bestSellers.map((p, i) => (
                <div key={p.productId} className={styles.rankRow}>
                  <span className={styles.rank}>{i + 1}</span>
                  <span className={styles.rankName}>{p.productName}</span>
                  <span className={styles.rankValue}>{p.quantitySold} шт</span>
                </div>
              ))}
            </Card>
            <Card>
              <h2 className={styles.sectionTitle}>Самые прибыльные</h2>
              {data.mostProfitable.map((p, i) => (
                <div key={p.productId} className={styles.rankRow}>
                  <span className={styles.rank}>{i + 1}</span>
                  <span className={styles.rankName}>{p.productName}</span>
                  <span className={styles.rankValue}>{formatMoney(p.profit)}</span>
                </div>
              ))}
            </Card>
          </div>

          <div className={styles.twoCol}>
            <Card>
              <h2 className={styles.sectionTitle}>Медленно продаются</h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Товар</Th>
                    <Th>Без продаж</Th>
                    <Th>Остаток</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.slowMoving.map((item) => (
                    <tr key={item.productId}>
                      <Td>{item.productName}</Td>
                      <Td>
                        <Badge tone="warn">{item.daysSinceLastSale} дн.</Badge>
                      </Td>
                      <Td numeric>{item.stockQuantity}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
            <Card>
              <h2 className={styles.sectionTitle}>Мёртвый запас</h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Товар</Th>
                    <Th>Без продаж</Th>
                    <Th>Остаток</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.deadStock.map((item) => (
                    <tr key={item.productId}>
                      <Td>{item.productName}</Td>
                      <Td>
                        <Badge tone="critical">{item.daysSinceLastSale} дн.</Badge>
                      </Td>
                      <Td numeric>{item.stockQuantity}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>

          <div className={styles.twoCol}>
            <Card>
              <h2 className={styles.sectionTitle}>Сотрудники</h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Сотрудник</Th>
                    <Th>Продаж</Th>
                    <Th>Сумма</Th>
                    <Th>Средний чек</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.employeeStats.map((e) => (
                    <tr key={e.userId}>
                      <Td>{e.fullName}</Td>
                      <Td numeric>{e.salesCount}</Td>
                      <Td numeric>{formatMoney(e.salesTotal)}</Td>
                      <Td numeric>{formatMoney(e.averageCheck)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
            <Card>
              <h2 className={styles.sectionTitle}>Сравнение филиалов</h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Филиал</Th>
                    <Th>Заказов</Th>
                    <Th>Выручка</Th>
                    <Th>Средний чек</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.branchComparison.map((b) => (
                    <tr key={b.branchId}>
                      <Td>{b.branchName}</Td>
                      <Td numeric>{b.ordersCount}</Td>
                      <Td numeric>{formatMoney(b.sales)}</Td>
                      <Td numeric>{formatMoney(b.averageCheck)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
