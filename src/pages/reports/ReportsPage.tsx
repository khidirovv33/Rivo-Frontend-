import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, PageHeader } from '@/components';
import { InventoryReport } from './InventoryReport';
import { SalesReport } from './SalesReport';
import styles from './ReportsPage.module.css';

type ReportId = 'sales' | 'inventory' | 'financial' | 'profit' | 'purchase' | 'employee' | 'audit' | 'inventoryDiff';

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
  kind: 'inline' | 'link' | 'soon';
  to?: string;
}

const REPORTS: ReportDef[] = [
  { id: 'sales', title: 'Отчёт по продажам', description: 'Заказы за период, выручка, средний чек.', kind: 'inline' },
  { id: 'inventory', title: 'Отчёт по остаткам', description: 'Остатки по складам: системное количество, резерв, доступно.', kind: 'inline' },
  { id: 'profit', title: 'Отчёт по прибыли', description: 'Выручка → себестоимость → валовая → чистая прибыль.', kind: 'link', to: '/finance/profit' },
  { id: 'inventoryDiff', title: 'Отчёт по расхождениям', description: 'План/факт по последним ревизиям.', kind: 'link', to: '/inventory' },
  { id: 'audit', title: 'Журнал действий', description: 'Кто, что и когда изменил в системе.', kind: 'link', to: '/audit-log' },
  { id: 'financial', title: 'Финансовый отчёт', description: 'Сводный отчёт по счетам и движению денег.', kind: 'soon' },
  { id: 'purchase', title: 'Отчёт по закупкам', description: 'Закупки по поставщикам за период.', kind: 'soon' },
  { id: 'employee', title: 'Отчёт по сотрудникам', description: 'Продажи и эффективность по кассирам.', kind: 'soon' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<ReportId | null>(null);

  const open = REPORTS.find((r) => r.id === openId) ?? null;

  function handleCardClick(report: ReportDef) {
    if (report.kind === 'inline') {
      setOpenId(report.id);
    } else if (report.kind === 'link' && report.to) {
      navigate(report.to);
    }
  }

  if (open) {
    return (
      <div>
        <div className={styles.backRow}>
          <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
            ← Ко всем отчётам
          </Button>
        </div>
        <PageHeader title={open.title} />
        {open.id === 'sales' && <SalesReport />}
        {open.id === 'inventory' && <InventoryReport />}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Отчёты" />
      <div className={styles.grid}>
        {REPORTS.map((report) => (
          <Card
            key={report.id}
            className={[styles.reportCard, report.kind === 'soon' ? styles.reportCardDisabled : ''].join(' ')}
            onClick={() => handleCardClick(report)}
          >
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>{report.title}</span>
              {report.kind === 'soon' && <Badge tone="neutral">Скоро</Badge>}
            </div>
            <span className={styles.cardDescription}>{report.description}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
