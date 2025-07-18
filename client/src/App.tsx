// client/src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import HomePage from './pages/HomePage';
import TenantPage from './pages/TenantPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import NewListingPage from './pages/dashboard/NewListingPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/t/:slug" element={<TenantPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard for authenticated users */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="listings/new" element={<NewListingPage />} />
            {/* Add other dashboard routes here (e.g., for managers, realtors) */}
          </Route>

          {/* Admin-only routes */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Add other admin-only routes here (e.g., user management) */}
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;