import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCustomAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  accountType: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user: customUser, isAuthenticated } = useCustomAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the custom profile to prevent unnecessary re-renders
  const customProfile = useMemo(() => {
    if (!customUser) return null;
    
    return {
      id: customUser.id,
      firstName: customUser.firstName || '',
      lastName: customUser.lastName || '',
      fullName: customUser.name || `${customUser.firstName || ''} ${customUser.lastName || ''}`.trim(),
      email: customUser.email || '',
      profilePicture: customUser.picture,
      isEmailVerified: customUser.isEmailVerified || false,
      accountType: customUser.accountType || 'free',
      isAdmin: customUser.isAdmin || false,
      createdAt: new Date().toISOString(),
    };
  }, [
    customUser?.id,
    customUser?.firstName,
    customUser?.lastName,
    customUser?.name,
    customUser?.email,
    customUser?.picture,
    customUser?.isEmailVerified,
    customUser?.accountType,
    customUser?.isAdmin
  ]);

  const fetchUserProfile = useCallback(async () => {
    if (!customUser || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get access token from localStorage (from your login flow)
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        // If no MongoDB token, use custom user data as fallback
        if (customProfile) {
          setUserProfile(customProfile);
        }
        setIsLoading(false);
        return;
      }

      // Fetch from MongoDB backend
      const response = await fetch('http://localhost:3002/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      
      if (data.success && data.data.user) {
        const mongoUser = data.data.user;
        const profile: UserProfile = {
          id: mongoUser.id,
          firstName: mongoUser.firstName,
          lastName: mongoUser.lastName,
          fullName: mongoUser.name || `${mongoUser.firstName} ${mongoUser.lastName}`.trim(),
          email: mongoUser.email,
          profilePicture: mongoUser.picture,
          isEmailVerified: mongoUser.isEmailVerified,
          accountType: mongoUser.accountType || 'free',
          isAdmin: mongoUser.isAdmin || false,
          createdAt: mongoUser.createdAt,
          lastLogin: mongoUser.lastLogin,
        };
        setUserProfile(profile);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      // Fallback to custom profile on error
      if (customProfile) {
        setUserProfile(customProfile);
      }
    } finally {
      setIsLoading(false);
    }
  }, [customUser, isAuthenticated, customProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const refetch = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    refetch
  };
};
