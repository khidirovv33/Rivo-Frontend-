import type { ComponentType, SVGProps } from 'react';
import type { SidebarItem } from '@/components';
import {
  AnalyticsIcon,
  AuditIcon,
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
  TransfersIcon,
  WarehouseIcon,
} from '@/components/icons';

interface NavItemConfig extends SidebarItem {
  // Право, необходимое для показа пункта — см. FRONTEND_TZ.md §5.4 (скрывать, не дизейблить).
  // Пункты без permission (Обзор/Профиль, а также чужие зоны Dev2/Dev3, которые пока просто
  // заглушки без реальных действий) показываются всем.
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
        { to: '/warehouse', label: 'Склад', icon: WarehouseIcon },
        { to: '/purchases', label: 'Закупки', icon: PurchasesIcon },
        { to: '/transfers', label: 'Перемещения', icon: TransfersIcon },
        { to: '/inventory', label: 'Ревизии', icon: InventoryIcon },
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
