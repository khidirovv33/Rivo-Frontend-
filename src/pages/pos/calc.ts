// Точное зеркало формулы из PosService.CheckoutAsync (Rivo.Application/Pos/Services/PosService.cs:95-162).
// Бэкенд валидирует |Σ(payments.amount) - totalAmount| ≤ 0.01 — если здесь посчитать иначе,
// кассир не сможет провести чек с суммой, которая на копейки разойдётся с сервером.
//
// Округление — обычное round-half-up (не C#-банковское MidpointRounding.ToEven): так как JS
// use IEEE754 double, а бэкенд — decimal, побитовый паритет невозможен в любом случае; операции
// с точными "половинными" суммами на 3-м знаке — редкий случай, а допуск в 0.01 его покрывает.

export interface CalcCartItem {
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  taxRate: number;
}

export interface CalcLine {
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface OrderTotals {
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  loyaltyDiscount: number;
  lines: CalcLine[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeOrderTotals(
  items: CalcCartItem[],
  orderDiscountAmount: number,
  loyaltyDiscountPercentage: number | null | undefined,
): OrderTotals {
  let subTotal = 0;
  let lineDiscountTotal = 0;
  let taxTotal = 0;

  const lines = items.map((item) => {
    const lineSubtotal = item.unitPrice * item.quantity - item.discountAmount;
    const lineTax = round2((lineSubtotal * item.taxRate) / 100);
    subTotal += item.unitPrice * item.quantity;
    lineDiscountTotal += item.discountAmount;
    taxTotal += lineTax;
    return { lineSubtotal, lineTax, lineTotal: lineSubtotal + lineTax };
  });

  const loyaltyDiscount =
    loyaltyDiscountPercentage && loyaltyDiscountPercentage > 0
      ? round2((subTotal * loyaltyDiscountPercentage) / 100)
      : 0;

  const discountTotal = orderDiscountAmount + lineDiscountTotal + loyaltyDiscount;
  const totalAmount = subTotal - discountTotal + taxTotal;

  return { subTotal, discountTotal, taxTotal, totalAmount, loyaltyDiscount, lines };
}

export function paymentsMatchTotal(paymentsSum: number, totalAmount: number): boolean {
  return Math.abs(paymentsSum - totalAmount) <= 0.01;
}
