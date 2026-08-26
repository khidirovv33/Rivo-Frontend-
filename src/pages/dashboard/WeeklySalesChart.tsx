import { formatMoney } from '@/lib/format';
import styles from './WeeklySalesChart.module.css';

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface WeeklySalesChartProps {
  points: { date: string; total: number }[];
}

const WIDTH = 700;
const HEIGHT = 220;
const PAD_X = 8;
const PAD_TOP = 36;
const PAD_BOTTOM = 28;

export function WeeklySalesChart({ points }: WeeklySalesChartProps) {
  const values = points.map((p) => p.total);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PAD_X + i * step,
    y: PAD_TOP + plotHeight - ((p.total - min) / range) * plotHeight,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const peakIndex = values.indexOf(max);
  const peak = coords[peakIndex];

  const gridLines = [0.25, 0.5, 0.75].map((f) => PAD_TOP + plotHeight * f);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
      {gridLines.map((y) => (
        <line key={y} x1={PAD_X} y1={y} x2={WIDTH - PAD_X} y2={y} className={styles.gridLine} />
      ))}

      {max > 0 && peak && (
        <text x={peak.x} y={Math.max(peak.y - 14, 14)} textAnchor="middle" className={styles.peakLabel}>
          {formatMoney(max)}
        </text>
      )}

      <path d={linePath} className={styles.line} fill="none" />

      {coords.map((c, i) => (
        <circle key={points[i].date} cx={c.x} cy={c.y} r={3.5} className={styles.dot} />
      ))}

      {points.map((p, i) => (
        <text key={p.date} x={coords[i].x} y={HEIGHT - 8} textAnchor="middle" className={styles.dayLabel}>
          {WEEKDAY_SHORT[new Date(`${p.date}T00:00:00`).getDay()]}
        </text>
      ))}
    </svg>
  );
}
