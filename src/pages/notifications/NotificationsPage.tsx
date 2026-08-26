import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, EmptyState, ErrorState, Loader, PageHeader } from '@/components';
import * as notificationsApi from '@/api/endpoints/notifications';
import { formatDateTime } from '@/lib/format';
import { NOTIFICATION_TYPE_LABEL, NOTIFICATION_TYPE_TONE } from './labels';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.listNotifications,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: invalidate,
  });

  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Уведомления"
        subtitle={unreadCount > 0 ? `Непрочитанных: ${unreadCount}` : undefined}
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
              Прочитать все
            </Button>
          )
        }
      />

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.length === 0 && <EmptyState message="Уведомлений пока нет." />}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((notification) => (
            <Card
              key={notification.id}
              className={[styles.row, notification.isRead ? '' : styles.rowUnread].join(' ')}
              onClick={() => !notification.isRead && markReadMutation.mutate(notification.id)}
            >
              <span className={[styles.dot, notification.isRead ? styles.dotHidden : ''].join(' ')} />
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.title}>{notification.title}</span>
                  <span className={styles.time}>{formatDateTime(notification.createdAt)}</span>
                </div>
                <span className={styles.message}>{notification.message}</span>
                <div>
                  <Badge tone={NOTIFICATION_TYPE_TONE[notification.type]}>
                    {NOTIFICATION_TYPE_LABEL[notification.type]}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
