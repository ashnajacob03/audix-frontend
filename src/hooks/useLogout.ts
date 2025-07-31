import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Signing out...');

      // Sign out from Clerk
      await signOut();

      // Clear any stored tokens and user data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      
      // Clear any other app-specific data
      sessionStorage.clear();

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success message
      toast.success('Signed out successfully');

      // Redirect to login page
      navigate('/login');
      
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Show error message
      toast.error('Error signing out. Please try again.');
      
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  return { logout };
};
