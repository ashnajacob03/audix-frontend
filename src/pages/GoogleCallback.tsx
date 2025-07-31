import  { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const syncUserWithMongoDB = async () => {
      if (isLoaded && user) {
        try {
          // Get Google credential from Clerk
          const googleAccount = user.externalAccounts.find(
            account => account.provider === 'google'
          );

          if (googleAccount) {
            // Sync with your MongoDB backend
            const response = await fetch('http://localhost:3002/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                credential: googleAccount.verification?.externalVerificationRedirectURL || '',
                email: user.primaryEmailAddress?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                picture: user.imageUrl,
                googleId: googleAccount.id
              }),
            });

            const data = await response.json();
            
            if (response.ok) {
              // Store MongoDB user data in localStorage for your app
              localStorage.setItem('mongoUser', JSON.stringify(data.data.user));
              localStorage.setItem('accessToken', data.data.tokens.accessToken);

              // Check if user is admin and redirect accordingly
              const userEmail = user.primaryEmailAddress?.emailAddress;
              const ADMIN_EMAIL = 'ashnajacob003@gmail.com';
              const isAdmin = data.data.user?.isAdmin || userEmail === ADMIN_EMAIL;

              if (isAdmin) {
                console.log('Admin user detected in Google callback, redirecting to admin dashboard');
                window.location.href = '/admin';
              } else {
                window.location.href = '/';
              }
            } else {
              console.error('Failed to sync with MongoDB:', data.message);
              // Check admin status even if MongoDB sync fails
              const userEmail = user.primaryEmailAddress?.emailAddress;
              const ADMIN_EMAIL = 'ashnajacob003@gmail.com';

              if (userEmail === ADMIN_EMAIL) {
                console.log('Admin user detected (fallback), redirecting to admin dashboard');
                window.location.href = '/admin';
              } else {
                window.location.href = '/'; // Still proceed to home
              }
            }
          }
        } catch (error) {
          console.error('Error syncing user with MongoDB:', error);
          // Check admin status even on error
          const userEmail = user.primaryEmailAddress?.emailAddress;
          const ADMIN_EMAIL = 'ashnajacob003@gmail.com';

          if (userEmail === ADMIN_EMAIL) {
            console.log('Admin user detected (error fallback), redirecting to admin dashboard');
            window.location.href = '/admin';
          } else {
            window.location.href = '/'; // Still proceed to home
          }
        }
      }
    };

    syncUserWithMongoDB();
  }, [isLoaded, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1db954]/10 to-[#191414] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1db954] mx-auto mb-4"></div>
        <p className="text-white">Setting up your account...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
