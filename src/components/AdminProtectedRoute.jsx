import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { isUserAdmin } from '../services/adminService';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
  const { t } = useTranslations();
  const { user, loading, isAdmin: contextIsAdmin } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // First check context (faster), then verify with service
          if (contextIsAdmin) {
            setIsAdmin(true);
            setChecking(false);
            return;
          }
          
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
      setChecking(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, contextIsAdmin]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text={t('common.verifyingAdminAccess')} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="mx-auto h-16 w-16 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('common.accessDenied')}</h2>
          <p className="text-gray-600 mb-6">{t('common.noPermissionAdmin')}</p>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('common.goToDashboard')}
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
