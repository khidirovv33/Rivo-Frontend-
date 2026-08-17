import type { SidebarItem } from '@/components';
import {
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
  TransfersIcon,
  WarehouseIcon,
} from '@/components/icons';

interface NavItemConfig extends SidebarItem {
  // Право, необходимое для показа пункта — см. FRONTEND_TZ.md §5.4 (скрывать, не дизейблить).
  // Пункты без permission (Обзор/Профиль, а также чужие зоны Dev2/Dev3, которые пока просто
  // заглушки без реальных действий) показываются всем.
  permission?: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { to: '/dashboard', label: 'Обзор', icon: DashboardIcon },
  { to: '/pos', label: 'Касса', icon: PosIcon, permission: 'Sales.Create' },
  { to: '/sales', label: 'Продажи', icon: SalesIcon, permission: 'Sales.Read' },
  { to: '/products', label: 'Товары', icon: ProductsIcon, permission: 'Products.Read' },
  { to: '/customers', label: 'Клиенты', icon: CustomersIcon, permission: 'Customers.Read' },
  { to: '/warehouse', label: 'Склад', icon: WarehouseIcon },
  { to: '/purchases', label: 'Закупки', icon: PurchasesIcon },
  { to: '/transfers', label: 'Перемещения', icon: TransfersIcon },
  { to: '/inventory', label: 'Ревизии', icon: InventoryIcon },
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
