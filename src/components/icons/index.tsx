import { createIcon } from './Icon';

export const DashboardIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>,
);

export const PosIcon = createIcon(
  <>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M2 3h2l2.2 11.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
  </>,
);

export const SalesIcon = createIcon(
  <>
    <path d="M4 4h16v4H4z" />
    <path d="M6 8v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8" />
    <path d="M10 12h4" />
  </>,
);

export const ProductsIcon = createIcon(
  <>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </>,
);

export const CustomersIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6.2" />
    <path d="M18 14a6.4 6.4 0 0 1 4 6" />
  </>,
);

export const WarehouseIcon = createIcon(
  <>
    <path d="M3 10l9-6 9 6" />
    <path d="M5 9v11h14V9" />
    <path d="M9 20v-6h6v6" />
  </>,
);

export const PurchasesIcon = createIcon(
  <>
    <rect x="1" y="6" width="15" height="11" rx="1" />
    <path d="M16 10h3l3 3v4h-6" />
    <circle cx="6" cy="19" r="1.6" />
    <circle cx="18" cy="19" r="1.6" />
  </>,
);

export const TransfersIcon = createIcon(
  <>
    <path d="M4 8h13" />
    <path d="M14 4l3 4-3 4" />
    <path d="M20 16H7" />
    <path d="M10 12l-3 4 3 4" />
  </>,
);

export const InventoryIcon = createIcon(
  <>
    <rect x="4" y="4" width="16" height="17" rx="1" />
    <path d="M9 3v3h6V3" />
    <path d="M8.5 13l2.2 2.2L15.5 11" />
  </>,
);

export const FinanceIcon = createIcon(
  <>
    <rect x="2" y="6" width="20" height="13" rx="1.5" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </>,
);

export const ReportsIcon = createIcon(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M2 20h20" />
  </>,
);

export const EmployeesIcon = createIcon(
  <>
    <circle cx="8" cy="8" r="3.2" />
    <circle cx="16" cy="8" r="3.2" />
    <path d="M2 20a6 6 0 0 1 12 0" />
    <path d="M10 20a6 6 0 0 1 12 0" />
  </>,
);

export const RolesIcon = createIcon(
  <>
    <path d="M12 3l7 3v6c0 5-3.4 8-7 9-3.6-1-7-4-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);

export const SettingsIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
  </>,
);

export const ProfileIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </>,
);

export const ChevronDownIcon = createIcon(<path d="M6 9l6 6 6-6" />);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);

export const PlusIcon = createIcon(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const TrashIcon = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </>,
);

export const EditIcon = createIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </>,
);

export const CloseIcon = createIcon(
  <>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </>,
);

export const MenuIcon = createIcon(
  <>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </>,
);

export const ManualSaleIcon = createIcon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 7h6" />
    <path d="M9 11h6" />
    <path d="M9 15h3" />
    <path d="M15 15l1.5 1.5L20 13" />
  </>,
);

export const CheckIcon = createIcon(<path d="M20 6L9 17l-5-5" />);

export const AlertIcon = createIcon(
  <>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v4" />
    <path d="M12 17.5h.01" />
  </>,
);

export const LogOutIcon = createIcon(
  <>
    <path d="M15 17l5-5-5-5" />
    <path d="M20 12H8" />
    <path d="M12 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7" />
  </>,
);

export const SuppliersIcon = createIcon(
  <>
    <path d="M3 21V9l7-5 7 5v12" />
    <path d="M3 21h17" />
    <path d="M10 21v-6h4v6" />
    <path d="M8 12h.01M12 12h.01" />
  </>,
);

export const BarcodeIcon = createIcon(
  <>
    <path d="M3 4v16" />
    <path d="M7 4v16" />
    <path d="M10 4v16" />
    <path d="M14 4v16" />
    <path d="M17 4v16" />
    <path d="M21 4v16" />
  </>,
);

export const PrinterIcon = createIcon(
  <>
    <path d="M6 9V3h12v6" />
    <rect x="4" y="9" width="16" height="8" rx="1" />
    <path d="M6 14h12v7H6z" />
  </>,
);

export const StoreIcon = createIcon(
  <>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M4 9v10h16V9" />
    <path d="M9 19v-6h6v6" />
  </>,
);

export const AnalyticsIcon = createIcon(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>,
);

export const AuditIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>,
);

export const BellIcon = createIcon(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const ChatIcon = createIcon(
  <>
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-4.5A8 8 0 1 1 21 12z" />
    <path d="M8 11h8" />
    <path d="M8 14.5h5" />
  </>,
);

export const SendIcon = createIcon(
  <>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </>,
);

export const MicIcon = createIcon(
  <>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
  </>,
);

export const MicOffIcon = createIcon(
  <>
    <path d="M3 3l18 18" />
    <path d="M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-.4 1.5" />
    <path d="M15 15a3 3 0 0 1-4.6-1" />
    <path d="M5 10v1a7 7 0 0 0 11 5.7" />
    <path d="M19 11v-1" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
  </>,
);

export const VolumeIcon = createIcon(
  <>
    <path d="M4 9v6h4l5 5V4L8 9H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a9 9 0 0 1 0 12" />
  </>,
);

export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M4.2 4.2l2.1 2.1" />
    <path d="M17.7 17.7l2.1 2.1" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M4.2 19.8l2.1-2.1" />
    <path d="M17.7 6.3l2.1-2.1" />
  </>,
);

export const MoonIcon = createIcon(
  <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />,
);
