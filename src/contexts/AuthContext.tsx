import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  picture?: string;
  profilePicture?: string;
  fullName?: string;
  isEmailVerified: boolean;
  accountType: string;
  isAdmin?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useCustomAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (storedUser && accessToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token is still valid by making a test request
          try {
            const response = await fetch('http://localhost:3002/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok && response.status === 401) {
              // Token expired, try to refresh
              if (refreshToken) {
                try {
                  const refreshResponse = await fetch('http://localhost:3002/api/auth/refresh-token', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                  });
                  
                  if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    localStorage.setItem('accessToken', refreshData.data.tokens.accessToken);
                    localStorage.setItem('refreshToken', refreshData.data.tokens.refreshToken);
                    console.log('Token refreshed successfully');
                  } else {
                    throw new Error('Refresh failed');
                  }
                } catch (refreshError) {
                  console.error('Token refresh failed:', refreshError);
                  // Clear all auth data
                  localStorage.removeItem('user');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  setUser(null);
                }
              } else {
                // No refresh token, clear auth data
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                setUser(null);
              }
            }
          } catch (testError) {
            console.error('Token validation failed:', testError);
            // Clear auth data on any error
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for token expiration events
    const handleTokenExpired = () => {
      console.log('Token expired, logging out user');
      // Clear local storage and redirect
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('mongoUser');
      window.location.href = '/login';
    };

    checkAuthStatus();
    
    // Add event listener for token expiration
    window.addEventListener('authTokenExpired', handleTokenExpired);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('authTokenExpired', handleTokenExpired);
    };
  }, []);

  const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    console.log('AuthContext: Storing user data and tokens:', {
      userData: userData,
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      tokenLength: tokens.accessToken?.length
    });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    
    console.log('AuthContext: Tokens stored, checking localStorage:', {
      storedAccessToken: !!localStorage.getItem('accessToken'),
      storedRefreshToken: !!localStorage.getItem('refreshToken'),
      storedUser: !!localStorage.getItem('user')
    });
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await fetch('http://localhost:3002/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('mongoUser');
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  // Debug logging for authentication state changes
  useEffect(() => {
    console.log('AuthContext state changed:', {
      user: user ? { id: user.id, email: user.email } : null,
      isAuthenticated: !!user,
      isLoading
    });
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};