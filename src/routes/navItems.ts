import type { SidebarItem } from '@/components';
import {
  BarcodeIcon,
  CustomersIcon,
  DashboardIcon,
  EmployeesIcon,
  FinanceIcon,
  InventoryIcon,
  PosIcon,
  ProductsIcon,
  ProfileIcon,
  PurchasesIcon,
  ReportsIcon,
  RolesIcon,
  SalesIcon,
  SettingsIcon,
  SuppliersIcon,
  TransfersIcon,
  WarehouseIcon,
} from '@/components/icons';

interface NavItemConfig extends SidebarItem {
  // Право, необходимое для показа пункта — см. FRONTEND_TZ.md §5.4 (скрывать, не дизейблить).
  // Пункты без permission (Обзор/Профиль, а также зона Dev3, которая пока просто заглушка без
  // реальных действий) показываются всем.
  permission?: string;
}

// Права зоны Dev2 (Warehouses/Stock/Suppliers/Purchases/Transfers/Inventory) подтверждены по
// реальному каталогу прав (роль Owner на локальном бэкенде, 2026-08-24): отдельных
// Warehouses.*/Suppliers.*/Purchases.*/Transfers.* НЕТ — вся зона целиком гейтится через
// Inventory.Read/Inventory.Create/Inventory.Approve, как и было написано в
// Rivo_Frontend_Dev2_Inventory_Operations.md (там это не только про ревизии).
export const NAV_ITEMS: NavItemConfig[] = [
  { to: '/dashboard', label: 'Обзор', icon: DashboardIcon },
  { to: '/pos', label: 'Касса', icon: PosIcon, permission: 'Sales.Create' },
  { to: '/sales', label: 'Продажи', icon: SalesIcon, permission: 'Sales.Read' },
  { to: '/products', label: 'Товары', icon: ProductsIcon, permission: 'Products.Read' },
  { to: '/customers', label: 'Клиенты', icon: CustomersIcon, permission: 'Customers.Read' },
  { to: '/warehouse', label: 'Склад', icon: WarehouseIcon, permission: 'Inventory.Read' },
  { to: '/suppliers', label: 'Поставщики', icon: SuppliersIcon, permission: 'Inventory.Read' },
  { to: '/purchases', label: 'Закупки', icon: PurchasesIcon, permission: 'Inventory.Read' },
  { to: '/transfers', label: 'Перемещения', icon: TransfersIcon, permission: 'Inventory.Read' },
  { to: '/inventory', label: 'Ревизии', icon: InventoryIcon, permission: 'Inventory.Read' },
  { to: '/barcodes', label: 'Штрихкоды', icon: BarcodeIcon, permission: 'Products.Read' },
  { to: '/finance', label: 'Финансы', icon: FinanceIcon },
  { to: '/reports', label: 'Отчёты', icon: ReportsIcon },
  { to: '/employees', label: 'Сотрудники', icon: EmployeesIcon, permission: 'Users.Read' },
  { to: '/roles', label: 'Роли', icon: RolesIcon, permission: 'Roles.Read' },
  { to: '/settings/stores', label: 'Магазины', icon: SettingsIcon, permission: 'Stores.Read' },
  { to: '/profile', label: 'Профиль', icon: ProfileIcon },
];

export function getVisibleNavItems(has: (permission: string) => boolean): SidebarItem[] {
  return NAV_ITEMS.filter((item) => !item.permission || has(item.permission));
}
