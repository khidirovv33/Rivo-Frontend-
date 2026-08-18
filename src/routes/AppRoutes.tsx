import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { RedirectIfAuthenticated } from '@/auth/RedirectIfAuthenticated';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ComingSoon } from '@/pages/_stubs/ComingSoon';
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
        <Route path="/dashboard" element={<ComingSoon title="Обзор" />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/categories" element={<CategoriesPage />} />
        <Route path="/products/brands" element={<BrandsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/loyalty-levels" element={<LoyaltyLevelsPage />} />
        <Route path="/warehouse" element={<ComingSoon title="Склад" />} />
        <Route path="/purchases" element={<ComingSoon title="Закупки" />} />
        <Route path="/transfers" element={<ComingSoon title="Перемещения" />} />
        <Route path="/inventory" element={<ComingSoon title="Ревизии" />} />
        <Route path="/finance" element={<ComingSoon title="Финансы" />} />
        <Route path="/reports" element={<ComingSoon title="Отчёты" />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/settings/stores" element={<StoresPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
