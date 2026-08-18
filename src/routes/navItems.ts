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

// Права зоны Dev2 (Warehouses/Suppliers/Purchases/Transfers/Inventory) в каталоге
// `GET /api/permissions` явно задокументированы только для ревизий (`Inventory.*`) —
// см. Rivo_Frontend_Dev2_Inventory_Operations.md. Остальные строки ниже (Suppliers.*,
// Purchases.*, Transfers.*) — по аналогии с существующим паттерном `{Модуль}.{Действие}`;
// сверить с реальным каталогом прав и поправить при расхождении.
export const NAV_ITEMS: NavItemConfig[] = [
  { to: '/dashboard', label: 'Обзор', icon: DashboardIcon },
  { to: '/pos', label: 'Касса', icon: PosIcon, permission: 'Sales.Create' },
  { to: '/sales', label: 'Продажи', icon: SalesIcon, permission: 'Sales.Read' },
  { to: '/products', label: 'Товары', icon: ProductsIcon, permission: 'Products.Read' },
  { to: '/customers', label: 'Клиенты', icon: CustomersIcon, permission: 'Customers.Read' },
  { to: '/warehouse', label: 'Склад', icon: WarehouseIcon, permission: 'Warehouses.Read' },
  { to: '/suppliers', label: 'Поставщики', icon: SuppliersIcon, permission: 'Suppliers.Read' },
  { to: '/purchases', label: 'Закупки', icon: PurchasesIcon, permission: 'Purchases.Read' },
  { to: '/transfers', label: 'Перемещения', icon: TransfersIcon, permission: 'Transfers.Read' },
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
