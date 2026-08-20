import { StockMovementType } from '@/types/domain';

export const STOCK_MOVEMENT_LABEL: Record<number, string> = {
  [StockMovementType.Receipt]: 'Приход',
  [StockMovementType.Issue]: 'Расход',
  [StockMovementType.Sale]: 'Продажа',
  [StockMovementType.Return]: 'Возврат',
  [StockMovementType.WriteOff]: 'Списание',
  [StockMovementType.Adjustment]: 'Корректировка',
  [StockMovementType.TransferOut]: 'Перемещение (исходящее)',
  [StockMovementType.TransferIn]: 'Перемещение (входящее)',
};

export const STOCK_MOVEMENT_TONE: Record<number, 'good' | 'warn' | 'critical' | 'neutral'> = {
  [StockMovementType.Receipt]: 'good',
  [StockMovementType.Issue]: 'warn',
  [StockMovementType.Sale]: 'good',
  [StockMovementType.Return]: 'neutral',
  [StockMovementType.WriteOff]: 'critical',
  [StockMovementType.Adjustment]: 'neutral',
  [StockMovementType.TransferOut]: 'warn',
  [StockMovementType.TransferIn]: 'good',
};
