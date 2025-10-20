import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/AuthContext';

interface AdminRedirectRouteProps {
  children: React.ReactNode;
}

const AdminRedirectRoute: React.FC<AdminRedirectRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading } = useCustomAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait for auth to load
      if (isLoading) return;

      // If no user, let the ProtectedRoute handle it
      if (!user) {
        setIsChecking(false);
        return;
      }

      const userEmail = user.email;
      const ADMIN_EMAIL = 'ashnajacob003@gmail.com';

      // Immediate redirect for admin email
      if (userEmail === ADMIN_EMAIL) {
        console.log('Admin user detected, redirecting to admin dashboard immediately');
        navigate('/admin', { replace: true });
        return;
      }

      // Also check MongoDB data if available
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/user/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user?.isAdmin) {
              console.log('Admin user detected from MongoDB, redirecting to admin dashboard');
              navigate('/admin', { replace: true });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }

      // Not an admin, allow normal rendering
      setIsChecking(false);
    };

    checkAdminStatus();
  }, [user, isLoading, navigate]);

  // Show loading while checking admin status
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if not admin
  return <>{children}</>;
};

export default AdminRedirectRoute;
