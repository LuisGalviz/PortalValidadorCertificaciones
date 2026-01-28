import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from '@/features/auth';
import { Profile } from '@portal/shared';
import { Navigate, createBrowserRouter } from 'react-router-dom';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
// Reports
import { ReportsListPage } from '@/pages/reports/ReportsListPage';

// OIAs
import { OiasListPage } from '@/pages/oias/OiasListPage';

// Inspectors
import { InspectorsListPage } from '@/pages/inspectors/InspectorsListPage';

// Construction Companies
import { ConstructionCompaniesListPage } from '@/pages/construction-companies/ConstructionCompaniesListPage';

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
          path: 'oias',
          element: (
            <ProtectedRoute allowedRoles={[Profile.Admin, Profile.Strategy]}>
              <OiasListPage />
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
            <ProtectedRoute allowedRoles={[Profile.Admin, Profile.Strategy]}>
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
