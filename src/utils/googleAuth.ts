// Google OAuth configuration and utilities
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleUser {
  credential: string;
  select_by: string;
}

interface GoogleUserInfo {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  sub: string; // Google ID
}

// Initialize Google OAuth
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google script is already loaded
    if (window.google) {
      resolve();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize Google Identity Services
      if (window.google) {
        resolve();
      } else {
        reject(new Error('Google Identity Services failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    
    document.head.appendChild(script);
  });
};

// Decode JWT token to get user info
const decodeJWT = (token: string): GoogleUserInfo => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

// Handle Google Sign-In
export const handleGoogleSignIn = async (
  onSuccess: (userInfo: GoogleUserInfo, credential: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    await initializeGoogleAuth();
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID not found in environment variables');
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleUser) => {
        try {
          const userInfo = decodeJWT(response.credential);
          onSuccess(userInfo, response.credential);
        } catch (error) {
          console.error('Error decoding Google credential:', error);
          onError('Failed to process Google authentication');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Prompt for sign-in
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to popup if prompt is not displayed
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: 400,
          }
        );
      }
    });
  } catch (error) {
    console.error('Google Sign-In initialization error:', error);
    onError('Failed to initialize Google Sign-In');
  }
};

// Render Google Sign-In button
export const renderGoogleSignInButton = (
  elementId: string,
  onSuccess: (userInfo: GoogleUserInfo, credential: string) => void,
  onError: (error: string) => void,
  options: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    width?: string;
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  } = {}
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await initializeGoogleAuth();
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID not found in environment variables');
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: GoogleUser) => {
          try {
            const userInfo = decodeJWT(response.credential);
            onSuccess(userInfo, response.credential);
          } catch (error) {
            console.error('Error decoding Google credential:', error);
            onError('Failed to process Google authentication');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: options.theme || 'outline',
          size: options.size || 'large',
          width: options.width || 400, // Use numeric value instead of percentage
          text: options.text || 'signin_with',
        }
      );

      resolve();
    } catch (error) {
      console.error('Error rendering Google Sign-In button:', error);
      reject(error);
    }
  });
};

// Sign out from Google
export const signOutFromGoogle = (): void => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// Check if user is signed in to Google
export const isGoogleSignedIn = (): boolean => {
  return !!(window.google && window.google.accounts);
};

export default {
  initializeGoogleAuth,
  handleGoogleSignIn,
  renderGoogleSignInButton,
  signOutFromGoogle,
  isGoogleSignedIn,
};
