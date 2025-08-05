import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '../contexts/AuthContext';
import { renderGoogleSignInButton } from '../utils/googleAuth';

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  width = '100%',
  onSuccess,
  onError
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { login } = useCustomAuth();

  useEffect(() => {
    const initializeButton = async () => {
      if (!buttonRef.current) return;

      try {
        await renderGoogleSignInButton(
          'google-signin-button',
          async (userInfo, credential) => {
            try {
              // Send the Google credential to your backend
              const response = await fetch('http://localhost:3002/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: userInfo.email,
                  firstName: userInfo.given_name,
                  lastName: userInfo.family_name,
                  picture: userInfo.picture,
                  googleId: userInfo.sub,
                  credential: credential
                }),
              });

              const data = await response.json();

              if (response.ok) {
                // Store user data using custom auth context
                login(data.data.user, data.data.tokens);

                // Check if user is admin and redirect accordingly
                const ADMIN_EMAIL = 'ashnajacob003@gmail.com';
                const isAdmin = data.data.user?.isAdmin || userInfo.email === ADMIN_EMAIL;

                if (isAdmin) {
                  console.log('Admin user detected in Google sign-in, redirecting to admin dashboard');
                  navigate('/admin', { replace: true });
                } else {
                  navigate('/', { replace: true });
                }

                // Call success callback if provided
                if (onSuccess) {
                  onSuccess();
                }
              } else {
                throw new Error(data.message || 'Google authentication failed');
              }
            } catch (error) {
              console.error('Google authentication error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
              if (onError) {
                onError(errorMessage);
              }
            }
          },
          (error) => {
            console.error('Google Sign-In error:', error);
            if (onError) {
              onError(error);
            }
          },
          {
            theme,
            size,
            width,
            text
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In button:', error);
        if (onError) {
          onError('Failed to initialize Google Sign-In');
        }
      }
    };

    initializeButton();
  }, [text, theme, size, width, navigate, login, onSuccess, onError]);

  return (
    <div className="w-full">
      <div
        id="google-signin-button"
        ref={buttonRef}
        className="w-full flex justify-center"
      />
    </div>
  );
};

export default GoogleSignInButton;
