export interface CartItem {
  key: string;
  productId: string;
  productVariationId?: string;
  name: string;
  variationLabel?: string;
  sku: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discountAmount: number;
}
