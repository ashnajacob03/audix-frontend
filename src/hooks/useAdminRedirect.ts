import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from './useUserProfile';

export const useAdminRedirect = () => {
  const navigate = useNavigate();
  const { userProfile, isLoading } = useUserProfile();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (isLoading) return;

    const checkAdminStatus = () => {
      // Check if user is admin from MongoDB data
      const userEmail = userProfile?.email;
      const isAdmin = userProfile?.isAdmin || false;
      
      // Admin email from environment (hardcoded for frontend check)
      const ADMIN_EMAIL = 'ashnajacob003@gmail.com';
      
      // Redirect to admin dashboard if user is admin
      if (userEmail === ADMIN_EMAIL || isAdmin) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin');
      }
    };

    // Only check after user data is loaded
    if (userProfile) {
      checkAdminStatus();
    }
  }, [userProfile, isLoading, navigate]);

  return {
    isAdmin: userProfile?.isAdmin || false,
    adminEmail: userProfile?.email
  };
};
