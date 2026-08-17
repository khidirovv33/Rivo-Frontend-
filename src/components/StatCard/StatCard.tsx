import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    direction: 'up' | 'down';
    label: string;
  };
  sparkline?: number[];
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 100;
  const height = 100;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - ((p - min) / range) * height}`)
    .join(' ');

  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatCard({ label, value, trend, sparkline }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {(trend || sparkline) && (
        <div className={styles.trendRow}>
          {trend && (
            <span className={[styles.trend, trend.direction === 'up' ? styles.trendUp : styles.trendDown].join(' ')}>
              {trend.direction === 'up' ? '▲' : '▼'} {trend.label}
            </span>
          )}
          {sparkline && (
            <span className={trend?.direction === 'up' ? styles.trendUp : trend?.direction === 'down' ? styles.trendDown : ''}>
              <Sparkline points={sparkline} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
