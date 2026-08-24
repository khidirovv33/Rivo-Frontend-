import { StockMovementType } from '@/types/domain';

export const STOCK_MOVEMENT_TYPE_LABEL: Record<number, string> = {
  [StockMovementType.Receipt]: 'Приход',
  [StockMovementType.Issue]: 'Расход',
  [StockMovementType.Sale]: 'Продажа',
  [StockMovementType.Return]: 'Возврат',
  [StockMovementType.WriteOff]: 'Списание',
  [StockMovementType.Adjustment]: 'Корректировка',
  [StockMovementType.Reservation]: 'Резервирование',
  [StockMovementType.Transfer]: 'Перемещение',
};

export const STOCK_MOVEMENT_TYPE_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [StockMovementType.Receipt]: 'good',
  [StockMovementType.Issue]: 'neutral',
  [StockMovementType.Sale]: 'good',
  [StockMovementType.Return]: 'warn',
  [StockMovementType.WriteOff]: 'critical',
  [StockMovementType.Adjustment]: 'neutral',
  [StockMovementType.Reservation]: 'warn',
  [StockMovementType.Transfer]: 'neutral',
};
