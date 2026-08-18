import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Loader, Modal, Select } from '@/components';
import * as loyaltyApi from '@/api/endpoints/loyalty';
import { extractErrorMessage } from '@/api/client';
import { formatDate } from '@/lib/format';
import type { CustomerDto } from '@/types/domain';
import styles from './LoyaltyCardModal.module.css';
import formStyles from '../_shared/CrudForm.module.css';

interface LoyaltyCardModalProps {
  customer: CustomerDto | null;
  onClose: () => void;
}

export function LoyaltyCardModal({ customer, onClose }: LoyaltyCardModalProps) {
  const queryClient = useQueryClient();
  const [levelId, setLevelId] = useState('');

  const { data: card, isLoading } = useQuery({
    queryKey: ['loyalty-card', customer?.id],
    queryFn: () => loyaltyApi.getLoyaltyCardByCustomer(customer!.id),
    enabled: customer !== null,
  });

  const { data: levels = [] } = useQuery({ queryKey: ['loyalty-levels'], queryFn: loyaltyApi.listLoyaltyLevels });

  const issueMutation = useMutation({
    mutationFn: () => loyaltyApi.issueLoyaltyCard({ customerId: customer!.id, loyaltyLevelId: levelId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-card', customer?.id] });
    },
  });

  return (
    <Modal open={customer !== null} onClose={onClose} title="Карта лояльности">
      {isLoading && <Loader />}
      {!isLoading && card && (
        <div className={styles.card}>
          <span className={styles.cardNumber}>{card.cardNumber}</span>
          <span className={styles.cardMeta}>
            Уровень: {card.loyaltyLevelName ?? '—'} ({card.loyaltyLevelDiscountPercentage}%)
          </span>
          <span className={styles.cardMeta}>Выдана: {formatDate(card.issuedAt)}</span>
          <span className={styles.cardMeta}>{card.isActive ? 'Активна' : 'Неактивна'}</span>
        </div>
      )}
      {!isLoading && !card && (
        <div className={styles.issueForm}>
          {issueMutation.isError && <div className={formStyles.error}>{extractErrorMessage(issueMutation.error)}</div>}
          <span className={styles.cardMeta}>У клиента ещё нет карты лояльности.</span>
          <Select label="Уровень (необязательно)" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            <option value="">Без уровня</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name} ({level.discountPercentage}%)
              </option>
            ))}
          </Select>
          <Button variant="primary" onClick={() => issueMutation.mutate()} disabled={issueMutation.isPending}>
            {issueMutation.isPending ? 'Оформляем…' : 'Выдать карту'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
