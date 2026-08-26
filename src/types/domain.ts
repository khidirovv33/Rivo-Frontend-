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
// DTO-поля — лучшее приближение к бэкенду по FRONTEND_TZ.md и Rivo_Frontend_Dev2_Inventory_Operations.md
// (точный контракт стока/движений/приёма/перемещений/ревизий не выгружен в этот репозиторий —
// см. заметку в PR о сверке с Rivo.Application/{Warehouses,Stock,Transfers,Inventories}/Dtos/*.cs).

export interface WarehouseDto {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  address: string | null;
  isDefault: boolean;
}

export interface CreateWarehouseRequest {
  branchId: string;
  name: string;
  address?: string;
}

export interface UpdateWarehouseRequest {
  name: string;
  address?: string;
  isDefault: boolean;
}

export interface StockDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  productSku: string;
  productVariationId: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export const StockMovementType = {
  Receipt: 1,
  Issue: 2,
  Sale: 3,
  Return: 4,
  WriteOff: 5,
  Adjustment: 6,
  Reservation: 7,
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export interface StockMovementDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

// ---- Suppliers ----

export const SupplierStatus = { Active: 1, Inactive: 2 } as const;
export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus];

export interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: SupplierStatus;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  status: SupplierStatus;
}

// ---- Purchase orders / Receiving ----

export const PurchaseOrderStatus = {
  Draft: 1,
  Sent: 2,
  PartiallyReceived: 3,
  Received: 4,
  Cancelled: 5,
} as const;
export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export interface PurchaseOrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productVariationId: string | null;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderDto {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  expectedDate: string | null;
  createdAt: string;
  items: PurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  warehouseId: string;
  expectedDate?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface ReceivingItemRequest {
  purchaseOrderItemId: string;
  quantityReceived: number;
}

export interface CreateReceivingRequest {
  purchaseOrderId: string;
  items: ReceivingItemRequest[];
  note?: string;
}

export interface ReceivingItemDto {
  purchaseOrderItemId: string;
  productName: string;
  quantityReceived: number;
}

export interface ReceivingDto {
  id: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  receivedByUserId: string;
  note: string | null;
  createdAt: string;
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
  productName: string;
  productSku: string;
  productVariationId: string | null;
  quantity: number;
}

export interface TransferDto {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: TransferStatus;
  createdAt: string;
  items: TransferItemDto[];
}

export interface CreateTransferItemRequest {
  productId: string;
  productVariationId?: string;
  quantity: number;
}

export interface CreateTransferRequest {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: CreateTransferItemRequest[];
}

// ---- Inventories (ревизии) ----

export const InventoryStatus = { InProgress: 1, Completed: 2, Cancelled: 3 } as const;
export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus];

export interface InventoryItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productVariationId: string | null;
  systemQuantity: number;
  actualQuantity: number | null;
  difference: number | null;
}

export interface InventoryDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  status: InventoryStatus;
  createdByUserId: string;
  createdAt: string;
  completedAt: string | null;
  items: InventoryItemDto[];
}

export interface CreateInventoryRequest {
  warehouseId: string;
}

export interface UpdateInventoryItemRequest {
  actualQuantity: number;
}

// ---- Barcodes ----

export interface GenerateBarcodeRequest {
  productId: string;
  productVariationId?: string;
}

export interface GenerateBarcodeResult {
  barcode: string;
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
