import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { RedirectIfAuthenticated } from '@/auth/RedirectIfAuthenticated';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { WarehousesPage } from '@/pages/warehouse/WarehousesPage';
import { StockPage } from '@/pages/warehouse/StockPage';
import { StockMovementsPage } from '@/pages/warehouse/StockMovementsPage';
import { PurchaseOrdersPage } from '@/pages/purchases/PurchaseOrdersPage';
import { ReceivingPage } from '@/pages/purchases/ReceivingPage';
import { PurchasesInvoicesPage } from '@/pages/purchases/PurchasesInvoicesPage';
import { SuppliersPage } from '@/pages/purchases/SuppliersPage';
import { TransfersPage } from '@/pages/transfers/TransfersPage';
import { InventoriesPage } from '@/pages/inventory/InventoriesPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { CategoriesPage } from '@/pages/products/CategoriesPage';
import { BrandsPage } from '@/pages/products/BrandsPage';
import { StoresPage } from '@/pages/settings/StoresPage';
import { POSPage } from '@/pages/pos/POSPage';
import { SalesPage } from '@/pages/sales/SalesPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { LoyaltyLevelsPage } from '@/pages/customers/LoyaltyLevelsPage';
import { EmployeesPage } from '@/pages/employees/EmployeesPage';
import { RolesPage } from '@/pages/roles/RolesPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { FinancePage } from '@/pages/finance/FinancePage';
import { ProfitPage } from '@/pages/finance/ProfitPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { AuditLogPage } from '@/pages/audit/AuditLogPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <RedirectIfAuthenticated>
            <AuthLayout />
          </RedirectIfAuthenticated>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/categories" element={<CategoriesPage />} />
        <Route path="/products/brands" element={<BrandsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/loyalty-levels" element={<LoyaltyLevelsPage />} />
        <Route path="/warehouse" element={<WarehousesPage />} />
        <Route path="/warehouse/stock" element={<StockPage />} />
        <Route path="/warehouse/movements" element={<StockMovementsPage />} />
        <Route path="/purchases" element={<PurchaseOrdersPage />} />
        <Route path="/purchases/receiving" element={<ReceivingPage />} />
        <Route path="/purchases/invoices" element={<PurchasesInvoicesPage />} />
        <Route path="/purchases/suppliers" element={<SuppliersPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/inventory" element={<InventoriesPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/finance/profit" element={<ProfitPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/settings/stores" element={<StoresPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
