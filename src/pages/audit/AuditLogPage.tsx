import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loader, PageHeader, Table, Td, TextField, Th } from '@/components';
import * as auditApi from '@/api/endpoints/audit';
import { formatDateTime } from '@/lib/format';
import styles from './AuditLogPage.module.css';

export function AuditLogPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-log'],
    queryFn: auditApi.listAuditLog,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (entry) =>
        entry.userName.toLowerCase().includes(term) ||
        entry.entityType.toLowerCase().includes(term) ||
        entry.entityId.toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <div>
      <PageHeader title="Журнал действий" />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Пользователь, сущность или ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && filtered.length === 0 && <EmptyState message="Записей не найдено." />}

      {!isLoading && !isError && filtered.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Когда</Th>
              <Th>Кто</Th>
              <Th>Действие</Th>
              <Th>Сущность</Th>
              <Th>Изменение</Th>
              <Th>IP</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <Td className="font-data">{formatDateTime(entry.occurredAt)}</Td>
                <Td>{entry.userName}</Td>
                <Td>{entry.action}</Td>
                <Td>
                  {entry.entityType}
                  <br />
                  <span className="font-data" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                    {entry.entityId}
                  </span>
                </Td>
                <Td>
                  <div className={styles.change}>
                    {entry.oldValue && <span className={styles.changeOld}>{entry.oldValue}</span>}
                    {entry.newValue && <span className={styles.changeNew}>{entry.newValue}</span>}
                  </div>
                </Td>
                <Td className="font-data">{entry.ipAddress}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
