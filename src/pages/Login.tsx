import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { testAuthFlow, testMusicAPIs } from '../utils/authTest';

const Login = () => {
  const { login } = useCustomAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorType, setErrorType] = useState<'validation' | 'auth' | 'network' | 'verification' | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType(null);

    // Enhanced validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }
    try {
      // First authenticate with your MongoDB backend
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok && response.status !== 401) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle different types of errors with specific messages
        if (data.requiresVerification) {
          setError('Please verify your email address before signing in. Check your inbox for the verification link.');
          setErrorType('verification');
          navigate('/verify-otp', {
            state: {
              userData: { email: data.email }
            },
            replace: true
          });
          return;
        }

        // Handle specific error cases
        switch (response.status) {
          case 401:
            if (data.code === 'USER_NOT_FOUND') {
              setError('No account found with this email address. Please check your email or sign up for a new account.');
              setErrorType('auth');
            } else if (data.code === 'INVALID_PASSWORD') {
              setError('The password you entered is incorrect. Please try again or reset your password.');
              setErrorType('auth');
            } else if (data.message?.includes('deactivated')) {
              setError('Your account has been deactivated. Please contact support for assistance.');
              setErrorType('auth');
            } else {
              setError(data.message || 'Authentication failed. Please check your credentials and try again.');
              setErrorType('auth');
            }
            break;
          case 400:
            setError('Please check your input and try again.');
            setErrorType('validation');
            break;
          case 429:
            setError('Too many login attempts. Please wait a few minutes before trying again.');
            setErrorType('auth');
            break;
          case 500:
            setError('We\'re experiencing technical difficulties. Please try again in a few moments.');
            setErrorType('network');
            break;
          default:
            setError(data.message || 'An unexpected error occurred. Please try again.');
            setErrorType('network');
        }
        setIsLoading(false);
        return;
      }
      // Use custom auth context to store user data
      login(data.data.user, data.data.tokens);
      
      console.log('MongoDB authentication successful');
      console.log('User data:', data.data.user);
      console.log('Tokens:', data.data.tokens);
      
      // Debug: Check what's stored in localStorage
      console.log('Stored user:', localStorage.getItem('user'));
      console.log('Stored access token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
      console.log('Stored refresh token:', localStorage.getItem('refreshToken') ? 'Present' : 'Missing');

      // Check if user is admin and redirect accordingly
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'ashnajacob003@gmail.com';
      if (email === ADMIN_EMAIL) {
        console.log('Admin user detected in login, redirecting to admin dashboard');
        navigate('/admin', { replace: true });
      } else {
        // For regular users, redirect to home
        console.log('Regular user login successful, redirecting to home');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle network errors and other exceptions
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to our servers. Please check your internet connection and try again.');
        setErrorType('network');
      } else if (err.message?.includes('timeout')) {
        setError('The request timed out. Please check your connection and try again.');
        setErrorType('network');
      } else if (err.message?.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
        setErrorType('network');
      } else if (err.message?.includes('HTTP error')) {
        setError('Server error. Please try again in a few moments.');
        setErrorType('network');
      } else {
        setError('An unexpected error occurred. Please try again or contact support if the problem persists.');
        setErrorType('network');
      }
    } finally {
      setIsLoading(false);
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
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        {/* Login Form */}
        <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828]">
          {error && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
              errorType === 'validation'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : errorType === 'verification'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : errorType === 'network'
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{error}</p>
                {errorType === 'auth' && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    {error.includes('No account found') ? (
                      <p className="text-xs opacity-80">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
                          Sign up here
                        </Link>
                      </p>
                    ) : (
                      <p className="text-xs opacity-80">
                        Forgot your password?{' '}
                        <Link to="/forgot-password" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
                          Reset it here
                        </Link>
                      </p>
                    )}
                  </div>
                )}
                {errorType === 'verification' && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <p className="text-xs opacity-80">
                      Didn't receive the email?{' '}
                      <button
                        type="button"
                        className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors underline"
                        onClick={() => {
                          // Add resend verification logic here
                          console.log('Resend verification email');
                        }}
                      >
                        Resend verification
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-[#1db954] hover:text-[#1ed760] text-sm font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#404040]"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-[#404040]"></div>
          </div>
          {/* Google Sign In Button */}
          <GoogleSignInButton
            text="signin_with"
            onError={(error) => setError(error)}
          />
        </div>
        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
              Sign up
            </Link>
          </p>
          
          {/* Debug Test Buttons - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-2">
              <button
                onClick={async () => {
                  console.log('=== RUNNING AUTH TEST ===');
                  await testAuthFlow();
                }}
                className="block w-full px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Test Auth Flow (Dev Only)
              </button>
              <button
                onClick={async () => {
                  console.log('=== RUNNING MUSIC API TEST ===');
                  await testMusicAPIs();
                }}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Test Music APIs (Dev Only)
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default Login;
