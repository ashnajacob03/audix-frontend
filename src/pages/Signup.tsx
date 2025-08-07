import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
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
  const [errorType, setErrorType] = useState<'validation' | 'auth' | 'network' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType(null);

    // Enhanced validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter both your first and last name');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setErrorType('validation');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please make sure both password fields are identical');
      setErrorType('validation');
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
        // Handle specific error cases
        switch (response.status) {
          case 400:
            if (data.message?.includes('already registered') || data.message?.includes('already exist')) {
              setError('An account with this email address already exists. Please sign in instead.');
              setErrorType('auth');
            } else {
              setError(data.message || 'Please check your information and try again.');
              setErrorType('validation');
            }
            break;
          case 429:
            setError('Too many signup attempts. Please wait a few minutes before trying again.');
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

      // Handle network errors and other exceptions
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to our servers. Please check your internet connection and try again.');
        setErrorType('network');
      } else if (err.message?.includes('timeout')) {
        setError('The request timed out. Please check your connection and try again.');
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
          <h1 className="text-4xl font-bold text-white mb-2">Join Us</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828]">
          {error && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
              errorType === 'validation'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : errorType === 'network'
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{error}</p>
                {errorType === 'auth' && error.includes('already exists') && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <p className="text-xs opacity-80">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                )}
              </div>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                  placeholder="Create a password (min 8 characters)"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
          <GoogleSignInButton
            text="signup_with"
            onError={(error) => setError(error)}
          />
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
      

    </div>
  );
};

export default Signup;
