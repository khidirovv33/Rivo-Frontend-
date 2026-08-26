import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, EmptyState, PageHeader, TextField } from '@/components';
import { useStoreBranch } from '@/store-context/useStoreBranch';
import * as posApi from '@/api/endpoints/pos';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import type { CustomerDto, OrderDto, PaymentMethod, ProductDto, ProductVariationDto } from '@/types/domain';
import { computeOrderTotals, paymentsMatchTotal } from '../pos/calc';
import { CartTable } from '../pos/CartTable';
import { ProductSearch } from '../pos/ProductSearch';
import { CustomerPicker } from '../pos/CustomerPicker';
import { PaymentPanel, type PaymentRow } from '../pos/PaymentPanel';
import { ReceiptPanel } from '../pos/ReceiptPanel';
import type { CartItem } from '../pos/types';
// Экран специально живёт отдельно от /pos (не переиспользует POSPage целиком) — если в самой кассе
// что-то сломается (баг конкретно на этом экране, зависший терминал и т.п.), у сотрудников остаётся
// независимый путь провести продажу тем же самым чек-эндпоинтом.
import styles from '../pos/POSPage.module.css';

export function ManualSalePage() {
  const { currentStore, currentBranch } = useStoreBranch();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [loyaltyDiscountPercentage, setLoyaltyDiscountPercentage] = useState<number | null>(null);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null);

  const totals = computeOrderTotals(
    cart.map((c) => ({
      unitPrice: c.unitPrice,
      quantity: c.quantity,
      discountAmount: c.discountAmount,
      taxRate: c.taxRate,
    })),
    orderDiscountAmount,
    loyaltyDiscountPercentage,
  );

  const paymentsSum = payments.reduce((acc, p) => acc + (Number.isFinite(p.amount) ? p.amount : 0), 0);
  const canCheckout =
    cart.length > 0 && payments.length > 0 && paymentsMatchTotal(paymentsSum, totals.totalAmount);

  const checkoutMutation = useMutation({
    mutationFn: () =>
      posApi.checkout({
        storeId: currentStore!.id,
        branchId: currentBranch!.id,
        customerId: customer?.id,
        orderDiscountAmount,
        items: cart.map((c) => ({
          productId: c.productId,
          productVariationId: c.productVariationId,
          quantity: c.quantity,
          discountAmount: c.discountAmount,
        })),
        payments: payments.map((p) => ({ method: p.method as PaymentMethod, amount: p.amount })),
      }),
    onSuccess: (order) => setCompletedOrder(order),
  });

  function addToCart(product: ProductDto, variation?: ProductVariationDto) {
    const key = product.id + (variation?.id ?? '');
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      const unitPrice = product.sellingPrice + (variation?.priceAdjustment ?? 0);
      const variationLabel = variation ? [variation.size, variation.color].filter(Boolean).join(' / ') : undefined;
      return [
        ...prev,
        {
          key,
          productId: product.id,
          productVariationId: variation?.id,
          name: product.name,
          variationLabel,
          sku: variation?.sku ?? product.sku,
          unitPrice,
          taxRate: product.taxRate,
          quantity: 1,
          discountAmount: 0,
        },
      ];
    });
  }

  function updateCartItem(key: string, patch: Partial<CartItem>) {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removeCartItem(key: string) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  function resetSale() {
    setCart([]);
    setCustomer(null);
    setLoyaltyDiscountPercentage(null);
    setOrderDiscountAmount(0);
    setPayments([]);
    setCompletedOrder(null);
    checkoutMutation.reset();
  }

  if (!currentStore || !currentBranch) {
    return (
      <div>
        <PageHeader title="Ручная продажа" />
        <EmptyState message="Выберите магазин и филиал в шапке, чтобы провести продажу вручную." />
      </div>
    );
  }

  if (completedOrder) {
    return (
      <div>
        <PageHeader title="Ручная продажа" />
        <Card>
          <ReceiptPanel order={completedOrder} onNewSale={resetSale} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ручная продажа"
        subtitle={`${currentStore.name} — ${currentBranch.name} · резервный способ провести чек, если касса недоступна`}
      />
      <div className={styles.grid}>
        <div className={styles.left}>
          <Card>
            <ProductSearch onAdd={addToCart} />
          </Card>
          <Card>
            <CartTable items={cart} lines={totals.lines} onUpdate={updateCartItem} onRemove={removeCartItem} />
          </Card>
        </div>

        <div className={styles.right}>
          <Card>
            <CustomerPicker
              customer={customer}
              loyaltyDiscountPercentage={loyaltyDiscountPercentage}
              onSelect={(c, d) => {
                setCustomer(c);
                setLoyaltyDiscountPercentage(d);
              }}
            />
          </Card>

          <Card>
            <div className={styles.discountField}>
              <TextField
                label="Скидка на чек"
                type="number"
                min={0}
                step="0.01"
                value={orderDiscountAmount}
                onChange={(e) => setOrderDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div className={styles.totals}>
              <div className={styles.totalsRow}>
                <span>Подытог</span>
                <span className="font-data">{formatMoney(totals.subTotal)}</span>
              </div>
              <div className={styles.totalsRow}>
                <span>Скидка</span>
                <span className="font-data">-{formatMoney(totals.discountTotal)}</span>
              </div>
              <div className={styles.totalsRow}>
                <span>Налог</span>
                <span className="font-data">{formatMoney(totals.taxTotal)}</span>
              </div>
              <div className={styles.totalsRowMain}>
                <span>Итого</span>
                <span className="font-data">{formatMoney(totals.totalAmount)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <PaymentPanel payments={payments} total={totals.totalAmount} onChange={setPayments} />
            {checkoutMutation.isError && (
              <div className={styles.checkoutError}>{extractErrorMessage(checkoutMutation.error)}</div>
            )}
            <Button
              variant="primary"
              className={styles.checkoutButton}
              disabled={!canCheckout || checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
            >
              {checkoutMutation.isPending ? 'Проводим…' : 'Провести продажу'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
