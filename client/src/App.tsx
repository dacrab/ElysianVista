// client/src/App.tsx

import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import HomePage from './pages/HomePage';
import TenantPage from './pages/TenantPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import NewListingPage from './pages/dashboard/NewListingPage';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/animation/PageTransition';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import ListingsPage from './pages/dashboard/ListingsPage';
import TeamPage from './pages/dashboard/TeamPage';
import SettingsPage from './pages/dashboard/SettingsPage';

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/t/:slug" element={<PageTransition><TenantPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard for authenticated users */}
          <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="listings" element={<ListingsPage />} />
            <Route path="listings/new" element={<NewListingPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Add other admin-only routes here (e.g., user management) */}
          </Route>
        </Route>
      </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;