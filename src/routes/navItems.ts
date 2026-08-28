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
  ManualSaleIcon,
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

// Права зоны Dev2 (Warehouses/Stock/Suppliers/Purchases/Transfers/Inventory) подтверждены по
// реальному каталогу прав (роль Owner на локальном бэкенде, 2026-08-24): отдельных
// Warehouses.*/Suppliers.*/Purchases.*/Transfers.* НЕТ — вся зона целиком гейтится через
// Inventory.Read/Inventory.Create/Inventory.Approve, как и было написано в
// Rivo_Frontend_Dev2_Inventory_Operations.md (там это не только про ревизии).
// label — ключ перевода (см. src/i18n/locales/*.json → "nav.*"), переводится в getVisibleNavEntries.
export const NAV_ENTRIES: NavEntryConfig[] = [
  { kind: 'item', item: { to: '/dashboard', label: 'nav.dashboard', icon: DashboardIcon } },
  {
    kind: 'group',
    group: {
      id: 'sales',
      label: 'nav.sales',
      icon: PosIcon,
      items: [
        { to: '/pos', label: 'nav.pos', icon: PosIcon, permission: 'Sales.Create' },
        { to: '/manual-sale', label: 'nav.manualSale', icon: ManualSaleIcon, permission: 'Sales.Create' },
        { to: '/sales', label: 'nav.salesHistory', icon: SalesIcon, permission: 'Sales.Read' },
        { to: '/customers', label: 'nav.customers', icon: CustomersIcon, permission: 'Customers.Read' },
      ],
    },
  },
  { kind: 'item', item: { to: '/products', label: 'nav.products', icon: ProductsIcon, permission: 'Products.Read' } },
  {
    kind: 'group',
    group: {
      id: 'warehouse',
      label: 'nav.warehouse',
      icon: WarehouseIcon,
      items: [
        { to: '/warehouse', label: 'nav.warehouse', icon: WarehouseIcon, permission: 'Inventory.Read' },
        { to: '/suppliers', label: 'nav.suppliers', icon: SuppliersIcon, permission: 'Inventory.Read' },
        { to: '/purchases', label: 'nav.purchases', icon: PurchasesIcon, permission: 'Inventory.Read' },
        { to: '/transfers', label: 'nav.transfers', icon: TransfersIcon, permission: 'Inventory.Read' },
        { to: '/inventory', label: 'nav.inventory', icon: InventoryIcon, permission: 'Inventory.Read' },
        { to: '/barcodes', label: 'nav.barcodes', icon: BarcodeIcon, permission: 'Products.Read' },
      ],
    },
  },
  {
    kind: 'group',
    group: {
      id: 'finance',
      label: 'nav.finance',
      icon: FinanceIcon,
      items: [
        { to: '/finance', label: 'nav.finance', icon: FinanceIcon },
        { to: '/reports', label: 'nav.reports', icon: ReportsIcon },
      ],
    },
  },
  { kind: 'item', item: { to: '/analytics', label: 'nav.analytics', icon: AnalyticsIcon } },
  {
    kind: 'group',
    group: {
      id: 'management',
      label: 'nav.management',
      icon: SettingsIcon,
      items: [
        { to: '/employees', label: 'nav.employees', icon: EmployeesIcon, permission: 'Users.Read' },
        { to: '/roles', label: 'nav.roles', icon: RolesIcon, permission: 'Roles.Read' },
        { to: '/settings/stores', label: 'nav.stores', icon: SettingsIcon, permission: 'Stores.Read' },
      ],
    },
  },
  { kind: 'item', item: { to: '/audit-log', label: 'nav.auditLog', icon: AuditIcon } },
  { kind: 'item', item: { to: '/notifications', label: 'nav.notifications', icon: BellIcon } },
  { kind: 'item', item: { to: '/profile', label: 'nav.profile', icon: ProfileIcon } },
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

export function getVisibleNavEntries(
  has: (permission: string) => boolean,
  t: (key: string) => string,
): VisibleNavEntry[] {
  const visible: VisibleNavEntry[] = [];
  for (const entry of NAV_ENTRIES) {
    if (entry.kind === 'item') {
      if (!entry.item.permission || has(entry.item.permission)) {
        visible.push({ kind: 'item', item: { ...entry.item, label: t(entry.item.label) } });
      }
    } else {
      const items = entry.group.items
        .filter((item) => !item.permission || has(item.permission))
        .map((item) => ({ ...item, label: t(item.label) }));
      if (items.length > 0) {
        visible.push({
          kind: 'group',
          id: entry.group.id,
          label: t(entry.group.label),
          icon: entry.group.icon,
          items,
        });
      }
    }
  }
  return visible;
}
