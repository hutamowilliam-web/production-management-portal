import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InternalRejectsPage from './pages/rejects/InternalRejectsPage';
import CustomerReturnsPage from './pages/returns/CustomerReturnsPage';
import SOPFailuresPage from './pages/sop/SOPFailuresPage';
import MaintenanceTicketsPage from './pages/maintenance/MaintenanceTicketsPage';
import ReportsPage from './pages/reports/ReportsPage';
import AdminPage from './pages/admin/AdminPage';
import ProfilePage from './pages/profile/ProfilePage';
import FormManagementPage from './pages/admin/FormManagementPage';
import InternalRejectFormPage from './pages/forms/InternalRejectFormPage';
import CustomerReturnFormPage from './pages/forms/CustomerReturnFormPage';
import SOPFailureFormPage from './pages/forms/SOPFailureFormPage';
import MaintenanceTicketFormPage from './pages/forms/MaintenanceTicketFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/rejects" element={<InternalRejectsPage />} />
                <Route path="/returns" element={<CustomerReturnsPage />} />
                <Route path="/sop" element={<SOPFailuresPage />} />
                <Route path="/maintenance" element={<MaintenanceTicketsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/forms" element={<FormManagementPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forms/internal-reject" element={<InternalRejectFormPage />} />
                <Route path="/forms/customer-return" element={<CustomerReturnFormPage />} />
                <Route path="/forms/sop-failure" element={<SOPFailureFormPage />} />
                <Route path="/forms/maintenance" element={<MaintenanceTicketFormPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <AppRoutes />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;