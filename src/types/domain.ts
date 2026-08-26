// TS-зеркало DTO бэкенда (см. Rivo.Application/*/Dtos/*.cs). Поля — camelCase, как отдаёт
// System.Text.Json по умолчанию. Enum'ы бэкенд отдаёт как raw int (JsonStringEnumConverter не
// зарегистрирован) — здесь они типизированы как union чисел с именованными константами рядом.

// ---- Users ----

export const UserStatus = {
  PendingVerification: 0,
  Active: 1,
  Blocked: 2,
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  roleId: string;
  roleName: string;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  status: UserStatus;
}

export interface UpdateOwnProfileRequest {
  fullName: string;
  phoneNumber?: string;
}

// ---- Auth ----

export interface AuthResult {
  userId: string;
  tenantId: string;
  fullName: string;
  email: string;
  roleName: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

export interface RegisterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ---- Roles / Permissions ----

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface PermissionDto {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string | null;
}

// ---- Stores / Branches ----

export const StoreStatus = { Active: 1, Inactive: 2 } as const;
export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus];

export interface BranchDto {
  id: string;
  storeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: StoreStatus;
}

export interface StoreDto {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: StoreStatus;
  currency: string;
  defaultTaxRate: number;
  openingHours: string | null;
  branches: BranchDto[];
}

export interface CreateStoreRequest {
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency: string;
  defaultTaxRate: number;
  openingHours?: string;
}

export interface UpdateStoreRequest extends CreateStoreRequest {
  status: StoreStatus;
}

export interface CreateBranchRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateBranchRequest extends CreateBranchRequest {
  status: StoreStatus;
}

// ---- Products / Categories / Brands ----

export const ProductStatus = { Active: 1, Inactive: 2, Discontinued: 3 } as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface ProductVariationDto {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  attributesJson: string | null;
  sku: string;
  barcode: string | null;
  priceAdjustment: number;
}

export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  description: string | null;
  imageUrl: string | null;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number | null;
  minimumPrice: number | null;
  unit: string;
  minimumStock: number;
  maximumStock: number | null;
  taxRate: number;
  status: ProductStatus;
  variations: ProductVariationDto[];
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  description?: string;
  imageUrl?: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minimumPrice?: number;
  unit: string;
  minimumStock: number;
  maximumStock?: number;
  taxRate: number;
}

export interface UpdateProductRequest extends Omit<CreateProductRequest, 'unit'> {
  unit: string;
  status: ProductStatus;
}

export interface CreateProductVariationRequest {
  size?: string;
  color?: string;
  attributesJson?: string;
  sku: string;
  barcode?: string;
  priceAdjustment: number;
}

export type UpdateProductVariationRequest = CreateProductVariationRequest;

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface BrandDto {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

export type UpdateBrandRequest = CreateBrandRequest;

// ---- Customers / Loyalty ----

export interface CustomerDto {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  totalPurchasesAmount: number;
  totalOrdersCount: number;
  loyaltyPoints: number;
}

export interface CreateCustomerRequest {
  fullName: string;
  phone?: string;
  email?: string;
  birthDate?: string;
}

export type UpdateCustomerRequest = CreateCustomerRequest;

export interface LoyaltyLevelDto {
  id: string;
  name: string;
  minimumSpend: number;
  discountPercentage: number;
}

export interface CreateLoyaltyLevelRequest {
  name: string;
  minimumSpend: number;
  discountPercentage: number;
}

export type UpdateLoyaltyLevelRequest = CreateLoyaltyLevelRequest;

export interface LoyaltyCardDto {
  id: string;
  customerId: string;
  cardNumber: string;
  loyaltyLevelId: string | null;
  loyaltyLevelName: string | null;
  loyaltyLevelDiscountPercentage: number;
  issuedAt: string;
  isActive: boolean;
}

export interface IssueLoyaltyCardRequest {
  customerId: string;
  loyaltyLevelId?: string;
}

// ---- Orders / Payments / POS ----

export const OrderStatus = {
  Completed: 1,
  PartiallyRefunded: 2,
  Refunded: 3,
  Voided: 4,
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = { Cash: 1, Card: 2, Other: 3 } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = { Pending: 1, Completed: 2, Failed: 3 } as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productVariationId: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  storeId: string;
  branchId: string;
  customerId: string | null;
  cashierUserId: string;
  status: OrderStatus;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItemDto[];
}

export interface PaymentDto {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paidAt: string;
}

export interface CheckoutItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
  discountAmount: number;
}

export interface CreatePaymentRequest {
  method: PaymentMethod;
  amount: number;
}

export interface CheckoutRequest {
  storeId: string;
  branchId: string;
  customerId?: string;
  orderDiscountAmount: number;
  items: CheckoutItemRequest[];
  payments: CreatePaymentRequest[];
}

// ---- Returns ----

export const ReturnStatus = { Completed: 1, PartiallyCompleted: 2, Rejected: 3 } as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

export interface ReturnItemDto {
  id: string;
  orderItemId: string;
  quantity: number;
  refundAmount: number;
}

export interface ReturnDto {
  id: string;
  orderId: string;
  processedByUserId: string;
  reason: string | null;
  totalRefundAmount: number;
  status: ReturnStatus;
  createdAt: string;
  items: ReturnItemDto[];
}

export interface CreateReturnItemRequest {
  orderItemId: string;
  quantity: number;
}

export interface CreateReturnRequest {
  orderId: string;
  reason?: string;
  items: CreateReturnItemRequest[];
}

// ---- Dashboard ----

export interface DailySalesPointDto {
  date: string;
  total: number;
}

export interface TopProductDto {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardDto {
  salesToday: number;
  salesChangePercent: number | null;
  ordersToday: number;
  ordersChangePercent: number | null;
  averageCheckToday: number;
  averageCheckChangePercent: number | null;
  lowStockProductCount: number;
  lowStockWarehouseCount: number;
  weeklySales: DailySalesPointDto[];
  topProducts: TopProductDto[];
}

// ---- Warehouses / Stock ----
// DTO-поля сверены напрямую по GET /swagger/v1/swagger.json запущенного бэкенда (localhost:5173,
// 2026-08-24) — актуальны для той версии API. Бэкенд НЕ денормализует связанные имена
// (productName/warehouseName/supplierName и т.п.) ни в один из DTO этой зоны — их нужно
// резолвить на фронте (см. useProductLookup и локальные Map по warehouses/suppliers).
// Статусные enum'ы (PurchaseOrderStatus/ReceivingStatus/TransferStatus/InventoryStatus/
// StockMovementType) на бэкенде отданы как голые int (JsonStringEnumConverter не зарегистрирован),
// без имён в Swagger — только количество значений. Значения ниже — порядок восстановлен по
// набору доступных action-эндпоинтов и естественному жизненному циклу; сверить с реальными
// данными и поправить при расхождении.

export interface WarehouseDto {
  id: string;
  storeId: string;
  branchId: string | null;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  storeId: string;
  branchId?: string;
  name: string;
  address?: string;
}

export interface UpdateWarehouseRequest {
  name: string;
  address?: string;
  isActive: boolean;
}

export interface StockDto {
  id: string;
  warehouseId: string;
  productId: string;
  productVariationId: string | null;
  systemQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

// Бэкенд отдаёт 8 значений (StockMovementType enum, Swagger без имён) — доку известны только 7
// смысловых видов операций (приход/расход/продажа/возврат/списание/корректировка/резервирование),
// восьмое здесь предположительно "перемещение" (Transfer), т.к. transfers тоже двигают сток.
export const StockMovementType = {
  Receipt: 1,
  Issue: 2,
  Sale: 3,
  Return: 4,
  WriteOff: 5,
  Adjustment: 6,
  Reservation: 7,
  Transfer: 8,
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export interface StockMovementDto {
  id: string;
  warehouseId: string;
  productId: string;
  productVariationId: string | null;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CreateStockMovementRequest {
  warehouseId: string;
  productId: string;
  productVariationId?: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

// ---- Suppliers ----

export interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  outstandingDebt: number;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  isActive: boolean;
}

// ---- Purchase orders / Purchases (payments+debt) / Receiving ----
// "purchase-orders" (заказ поставщику, документооборот) и "purchases" (факт закупки с
// оплатами/задолженностью, создаётся при приёмке — см. PurchaseDto.receivingId) — два разных
// ресурса на бэкенде, не путать.

export const PurchaseOrderStatus = {
  Draft: 1,
  Sent: 2,
  Confirmed: 3,
  PartiallyReceived: 4,
  Received: 5,
  Cancelled: 6,
} as const;
export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export interface PurchaseOrderItemDto {
  id: string;
  productId: string;
  productVariationId: string | null;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  remainingQuantity: number;
}

export interface PurchaseOrderDto {
  id: string;
  supplierId: string;
  warehouseId: string;
  orderNumber: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate: string | null;
  notes: string | null;
  totalAmount: number;
  items: PurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  warehouseId: string;
  expectedDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface PurchaseDto {
  id: string;
  supplierId: string;
  purchaseOrderId: string;
  receivingId: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  notes: string | null;
}

export interface RecordPaymentRequest {
  amount: number;
  notes?: string;
}

export const ReceivingStatus = { Draft: 1, Completed: 2, Cancelled: 3 } as const;
export type ReceivingStatus = (typeof ReceivingStatus)[keyof typeof ReceivingStatus];

export interface ReceivingItemRequest {
  purchaseOrderItemId: string;
  quantityReceived: number;
  unitCost?: number;
}

export interface CreateReceivingRequest {
  purchaseOrderId: string;
  notes?: string;
  items: ReceivingItemRequest[];
}

export interface ReceivingItemDto {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productVariationId: string | null;
  quantityReceived: number;
  unitCost: number;
}

export interface ReceivingDto {
  id: string;
  purchaseOrderId: string;
  warehouseId: string;
  receivingDate: string;
  status: ReceivingStatus;
  notes: string | null;
  items: ReceivingItemDto[];
}

// ---- Transfers ----

export const TransferStatus = {
  Draft: 1,
  Pending: 2,
  Approved: 3,
  Shipped: 4,
  Received: 5,
  Cancelled: 6,
} as const;
export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus];

export interface TransferItemDto {
  id: string;
  productId: string;
  productVariationId: string | null;
  quantity: number;
}

export interface TransferDto {
  id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  transferNumber: string;
  status: TransferStatus;
  transferDate: string;
  notes: string | null;
  items: TransferItemDto[];
}

export interface CreateTransferItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
}

export interface CreateTransferRequest {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  notes?: string;
  items: CreateTransferItemRequest[];
}

// ---- Inventories (ревизии) ----
// Позиции ревизии заполняются сканированием (POST .../items/scan с абсолютным actualQuantity —
// повторный скан того же товара перезаписывает количество, не суммирует), а не произвольным PUT.

export const InventoryStatus = { InProgress: 1, Completed: 2, Approved: 3, Cancelled: 4 } as const;
export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus];

export interface InventoryItemDto {
  id: string;
  inventoryId: string;
  productId: string;
  productVariationId: string | null;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  unitCost: number;
  differenceCost: number;
}

export interface InventoryDto {
  id: string;
  warehouseId: string;
  inventoryNumber: string;
  status: InventoryStatus;
  responsibleUserId: string;
  startedAt: string;
  completedAt: string | null;
  approvedAt: string | null;
  notes: string | null;
  items: InventoryItemDto[];
  shortageQuantity: number;
  surplusQuantity: number;
  shortageCost: number;
  surplusCost: number;
}

export interface CreateInventoryRequest {
  warehouseId: string;
  notes?: string;
}

export interface ScanInventoryItemRequest {
  productId: string;
  productVariationId?: string;
  actualQuantity: number;
  unitCost?: number;
}

// ---- Barcodes ----

// Значения не подписаны в Swagger (голый int enum из 3 вариантов) — вероятно EAN-13/Code128/QR.
export const BarcodeType = { Type1: 1, Type2: 2, Type3: 3 } as const;
export type BarcodeType = (typeof BarcodeType)[keyof typeof BarcodeType];

export interface BarcodeDto {
  id: string;
  productId: string;
  productVariationId: string | null;
  code: string;
  type: BarcodeType;
  isPrimary: boolean;
}

export interface GenerateBarcodeRequest {
  productId: string;
  productVariationId?: string;
  type: BarcodeType;
  isPrimary: boolean;
}

export interface RegisterBarcodeRequest {
  productId: string;
  productVariationId?: string;
  code: string;
  type: BarcodeType;
  isPrimary: boolean;
}

// ---- AI-помощник (проксирует чат к OpenAI на бэкенде — ключ туда не долетает) ----

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskAssistantRequest {
  messages: ChatMessage[];
}

export interface AssistantReply {
  reply: string;
}
