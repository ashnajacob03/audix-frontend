import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCustomAuth } from '../contexts/AuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: customLogout } = useCustomAuth();

  const logout = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Signing out...');

      // Use custom logout which handles backend logout
      await customLogout();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success('Signed out successfully');

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
