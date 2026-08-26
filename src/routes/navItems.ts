import type { ComponentType, SVGProps } from 'react';
import type { SidebarItem } from '@/components';
import {
  AnalyticsIcon,
  AuditIcon,
  BarcodeIcon,
  BellIcon,
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
  // Пункты без permission (Обзор/Профиль) показываются всем.
  permission?: string;
}

interface NavGroupConfig {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: NavItemConfig[];
}

// Верхнеуровневый список сайдбара: одиночные ссылки вперемешку со сворачиваемыми группами,
// в том порядке, в котором должны идти в меню.
export type NavEntryConfig = { kind: 'item'; item: NavItemConfig } | { kind: 'group'; group: NavGroupConfig };

// Права зоны Dev2 (Warehouses/Suppliers/Purchases/Transfers/Inventory) в каталоге
// `GET /api/permissions` явно задокументированы только для ревизий (`Inventory.*`) —
// см. Rivo_Frontend_Dev2_Inventory_Operations.md. Остальные строки ниже (Suppliers.*,
// Purchases.*, Transfers.*, Warehouses.*) — по аналогии с существующим паттерном
// `{Модуль}.{Действие}`; сверить с реальным каталогом прав и поправить при расхождении.
export const NAV_ENTRIES: NavEntryConfig[] = [
  { kind: 'item', item: { to: '/dashboard', label: 'Обзор', icon: DashboardIcon } },
  {
    kind: 'group',
    group: {
      id: 'sales',
      label: 'Продажи',
      icon: PosIcon,
      items: [
        { to: '/pos', label: 'Касса', icon: PosIcon, permission: 'Sales.Create' },
        { to: '/sales', label: 'Продажи', icon: SalesIcon, permission: 'Sales.Read' },
        { to: '/customers', label: 'Клиенты', icon: CustomersIcon, permission: 'Customers.Read' },
      ],
    },
  },
  { kind: 'item', item: { to: '/products', label: 'Товары', icon: ProductsIcon, permission: 'Products.Read' } },
  {
    kind: 'group',
    group: {
      id: 'warehouse',
      label: 'Склад',
      icon: WarehouseIcon,
      items: [
        { to: '/warehouse', label: 'Склад', icon: WarehouseIcon, permission: 'Warehouses.Read' },
        { to: '/suppliers', label: 'Поставщики', icon: SuppliersIcon, permission: 'Suppliers.Read' },
        { to: '/purchases', label: 'Закупки', icon: PurchasesIcon, permission: 'Purchases.Read' },
        { to: '/transfers', label: 'Перемещения', icon: TransfersIcon, permission: 'Transfers.Read' },
        { to: '/inventory', label: 'Ревизии', icon: InventoryIcon, permission: 'Inventory.Read' },
        { to: '/barcodes', label: 'Штрихкоды', icon: BarcodeIcon, permission: 'Products.Read' },
      ],
    },
  },
  {
    kind: 'group',
    group: {
      id: 'finance',
      label: 'Финансы',
      icon: FinanceIcon,
      items: [
        { to: '/finance', label: 'Финансы', icon: FinanceIcon },
        { to: '/reports', label: 'Отчёты', icon: ReportsIcon },
      ],
    },
  },
  { kind: 'item', item: { to: '/analytics', label: 'Аналитика', icon: AnalyticsIcon } },
  {
    kind: 'group',
    group: {
      id: 'management',
      label: 'Управление',
      icon: SettingsIcon,
      items: [
        { to: '/employees', label: 'Сотрудники', icon: EmployeesIcon, permission: 'Users.Read' },
        { to: '/roles', label: 'Роли', icon: RolesIcon, permission: 'Roles.Read' },
        { to: '/settings/stores', label: 'Магазины', icon: SettingsIcon, permission: 'Stores.Read' },
      ],
    },
  },
  { kind: 'item', item: { to: '/audit-log', label: 'Журнал', icon: AuditIcon } },
  { kind: 'item', item: { to: '/notifications', label: 'Уведомления', icon: BellIcon } },
  { kind: 'item', item: { to: '/profile', label: 'Профиль', icon: ProfileIcon } },
];

export type VisibleNavEntry =
  | { kind: 'item'; item: SidebarItem }
  | {
      kind: 'group';
      id: string;
      label: string;
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      items: SidebarItem[];
    };

export function getVisibleNavEntries(has: (permission: string) => boolean): VisibleNavEntry[] {
  const visible: VisibleNavEntry[] = [];
  for (const entry of NAV_ENTRIES) {
    if (entry.kind === 'item') {
      if (!entry.item.permission || has(entry.item.permission)) {
        visible.push({ kind: 'item', item: entry.item });
      }
    } else {
      const items = entry.group.items.filter((item) => !item.permission || has(item.permission));
      if (items.length > 0) {
        visible.push({ kind: 'group', id: entry.group.id, label: entry.group.label, icon: entry.group.icon, items });
      }
    }
  }
  return visible;
}
