import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from '@/features/auth';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ConstructionCompaniesListPage } from '@/pages/construction-companies/ConstructionCompaniesListPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { InspectorsListPage } from '@/pages/inspectors/InspectorsListPage';
import { MyOiaPage } from '@/pages/oias/MyOiaPage';
import { OiaCreatePage } from '@/pages/oias/OiaCreatePage';
import { OiaEditPage } from '@/pages/oias/OiaEditPage';
import { OiaUsersListPage } from '@/pages/oias/OiaUsersListPage';
import { OiasListPage } from '@/pages/oias/OiasListPage';
import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
import { ReportsListPage } from '@/pages/reports/ReportsListPage';
import { Permissions } from '@portal/shared';
import { Navigate, createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: 'reports',
          element: <ReportsListPage />,
        },
        {
          path: 'reports/:id',
          element: <ReportDetailPage />,
        },
        {
          path: 'oias/new',
          element: (
            <ProtectedRoute requiredPermission={Permissions.OIAS_CREATE}>
              <OiaCreatePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'oias',
          element: (
            <ProtectedRoute requiredPermission={Permissions.OIAS_READ}>
              <OiasListPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'oias/:id/users',
          element: (
            <ProtectedRoute requiredPermission={Permissions.OIAS_READ}>
              <OiaUsersListPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'oias/:id',
          element: (
            <ProtectedRoute requiredPermission={Permissions.OIAS_UPDATE}>
              <OiaEditPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'my-oia',
          element: (
            <ProtectedRoute requiredPermission={Permissions.OIAS_READ_OWN}>
              <MyOiaPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'inspectors',
          element: <InspectorsListPage />,
        },
        {
          path: 'construction-companies',
          element: (
            <ProtectedRoute requiredPermission={Permissions.COMPANIES_READ}>
              <ConstructionCompaniesListPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);
