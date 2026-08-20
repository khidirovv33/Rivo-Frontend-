import { formatMoney } from '@/lib/format';
import type { ProfitTrendPointDto } from '@/types/mocks';
import styles from './ProfitTrendChart.module.css';

const WIDTH = 700;
const HEIGHT = 220;
const PAD_X = 8;
const PAD_TOP = 30;
const PAD_BOTTOM = 24;

function buildPath(values: number[], min: number, range: number, plotHeight: number, step: number) {
  return values
    .map((v, i) => {
      const x = PAD_X + i * step;
      const y = PAD_TOP + plotHeight - ((v - min) / range) * plotHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function ProfitTrendChart({ points }: { points: ProfitTrendPointDto[] }) {
  const revenue = points.map((p) => p.revenue);
  const profit = points.map((p) => p.netProfit);
  const allValues = [...revenue, ...profit];
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const gridLines = [0.25, 0.5, 0.75].map((f) => PAD_TOP + plotHeight * f);

  const lastProfitY = PAD_TOP + plotHeight - ((profit[profit.length - 1] - min) / range) * plotHeight;
  const lastX = PAD_X + (points.length - 1) * step;

  return (
    <div className={styles.wrapper}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.swatchRevenue].join(' ')} /> Выручка
        </span>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.swatchProfit].join(' ')} /> Чистая прибыль
        </span>
      </div>
      <svg className={styles.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        {gridLines.map((y) => (
          <line key={y} x1={PAD_X} y1={y} x2={WIDTH - PAD_X} y2={y} className={styles.gridLine} />
        ))}

        <path d={buildPath(revenue, min, range, plotHeight, step)} className={styles.revenueLine} fill="none" />
        <path d={buildPath(profit, min, range, plotHeight, step)} className={styles.profitLine} fill="none" />

        <circle cx={lastX} cy={lastProfitY} r={3.5} className={styles.profitDot} />
        <text x={lastX} y={Math.max(lastProfitY - 12, 12)} textAnchor="end" className={styles.endLabel}>
          {formatMoney(profit[profit.length - 1])}
        </text>

        {points.map((p, i) => (
          <text key={p.periodLabel} x={PAD_X + i * step} y={HEIGHT - 6} textAnchor="middle" className={styles.monthLabel}>
            {p.periodLabel}
          </text>
        ))}
      </svg>
    </div>
  );
}
