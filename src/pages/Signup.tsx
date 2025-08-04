import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { cleanupUser } from '../utils/userCleanup';

const Signup = () => {
  const { signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCleanupUser = async () => {
    if (!formData.email.trim()) {
      setError('Please enter an email address to cleanup');
      return;
    }

    setIsCleaningUp(true);
    setError('');

    try {
      const result = await cleanupUser(formData.email.trim());
      if (result.success) {
        setError(''); // Clear any previous errors
        alert(`✅ Cleanup successful!\n\nMongoDB user deleted: ${result.details?.mongoUserDeleted ? 'Yes' : 'No'}\nClerk user deleted: ${result.details?.clerkUserDeleted ? 'Yes' : 'No'}\n\nYou can now try signing up again.`);
      } else {
        setError(`Cleanup failed: ${result.message}`);
      }
    } catch (err: any) {
      setError(`Cleanup error: ${err.message}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      setIsLoading(false);
      return;
    }

    try {
      // First, create user in your MongoDB database
      const response = await fetch('http://localhost:3002/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Success! User created in backend, now redirect to OTP verification
      console.log('User created successfully in backend');
      
      // Redirect to OTP verification page with user data
      navigate('/verify-otp', { 
        state: { 
          userData: data.data.user 
        },
        replace: true 
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Backend server is not running. Please start the backend server.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleGoogleSignUp = async () => {
    try {
      await signUp?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.origin + '/auth/google-callback',
        redirectUrlComplete: window.location.origin + '/dashboard',
      });
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError('Google sign-up failed. Please try again.');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1db954]/10 to-[#191414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1db954] rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C13.1 2 14 2.9 14 4V6.28C16.24 6.62 18 8.57 18 11V16L20 18V19H4V18L6 16V11C6 8.57 7.76 6.62 10 6.28V4C10 2.9 10.9 2 12 2Z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Us</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}

              {/* Show login suggestion for existing users */}
              {(error.includes('already registered') || error.includes('already exist')) && (
                <div className="mt-3 pt-3 border-t border-red-500/30">
                  <p className="text-xs text-gray-300 mb-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              )}

              {/* Only show cleanup button when explicitly enabled (for developers only) */}
              {(error.includes('already registered') || error.includes('already exist')) &&
               import.meta.env.VITE_SHOW_DEV_TOOLS === 'true' && (
                <div className="mt-3 pt-3 border-t border-red-500/30">
                  <p className="text-xs text-gray-400 mb-2">
                    🛠️ Development: If you deleted this user manually, click below to cleanup both systems:
                  </p>
                  <button
                    type="button"
                    onClick={handleCleanupUser}
                    disabled={isCleaningUp}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    {isCleaningUp ? 'Cleaning up...' : 'Cleanup User Data'}
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                  placeholder="First name"
                  required
                  minLength={1}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                  placeholder="Last name"
                  required
                  minLength={1}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                placeholder="Create a password (min 8 characters)"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#404040]"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-[#404040]"></div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 border border-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* CAPTCHA element for Clerk */}
      <div id="clerk-captcha" style={{ display: 'none' }}></div>
    </div>
  );
};

export default Signup;
