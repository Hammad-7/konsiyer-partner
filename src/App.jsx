import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import { useState } from 'react';
import { useTranslations } from './hooks/useTranslations';
import Login from './components/Login';
import DashboardRouter from './components/DashboardRouter';
import Invoices from './components/Invoices';
import InvoiceDetail from './components/InvoiceDetail';
import Settings from './components/Settings';
import Shops from './components/Shops';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import FeatureProtectedRoute from './components/FeatureProtectedRoute';
import ConditionalRedirect from './components/ConditionalRedirect';
import ConnectProtectedRoute from './components/ConnectProtectedRoute';
import DashboardProtectedRoute from './components/DashboardProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import UnifiedNavbar from './components/Navbar';
import DashboardLayout from './components/layouts/DashboardLayout';
import ConnectShopPage from './components/onboarding/ConnectShopPage';
import ShopifyConnectPage from './components/onboarding/ShopifyConnectPage';
import OtherShopConnectPage from './components/onboarding/OtherShopConnectPage';
import IkasConnectPage from './components/onboarding/IkasConnectPage';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDetails from './components/admin/UserDetails';
import ShopDetails from './components/admin/ShopDetails';
import IkasProcessingPipeline from './components/admin/IkasProcessingPipeline';
import OnboardingManagement from './components/admin/OnboardingManagement';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslations();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text={t('common.initializing')} />
      </div>
    );
  }

  return (
    <>
      <UnifiedNavbar 
        onAuthModeChange={setAuthMode} 
        authMode={authMode}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <ProtectedRoute>
                <ConditionalRedirect />
              </ProtectedRoute>
            ) : (
              <Login authMode={authMode} setAuthMode={setAuthMode} />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <DashboardRouter />
                </DashboardLayout>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <FeatureProtectedRoute>
                  <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                    <Invoices />
                  </DashboardLayout>
                </FeatureProtectedRoute>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invoices/:id" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <FeatureProtectedRoute>
                  <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                    <InvoiceDetail />
                  </DashboardLayout>
                </FeatureProtectedRoute>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <FeatureProtectedRoute>
                  <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                    <Invoices />
                  </DashboardLayout>
                </FeatureProtectedRoute>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shops" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <FeatureProtectedRoute>
                  <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                    <Shops />
                  </DashboardLayout>
                </FeatureProtectedRoute>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <DashboardProtectedRoute>
                <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Settings />
                </DashboardLayout>
              </DashboardProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connect" 
          element={
            <ProtectedRoute>
              <ConnectProtectedRoute>
                <ConnectShopPage />
              </ConnectProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connect/shopify" 
          element={
            <ProtectedRoute>
              <ConnectProtectedRoute>
                <ShopifyConnectPage />
              </ConnectProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connect/other" 
          element={
            <ProtectedRoute>
              <ConnectProtectedRoute>
                <OtherShopConnectPage />
              </ConnectProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connect/ikas" 
          element={
            <ProtectedRoute>
              <ConnectProtectedRoute>
                <IkasConnectPage />
              </ConnectProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/onboarding" 
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <OnboardingManagement />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/:userId" 
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <UserDetails />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/shops/:userId/:shopId" 
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <ShopDetails />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/shops/:userId/:shopId/process-ikas" 
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <IkasProcessingPipeline />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <AppContent />
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
