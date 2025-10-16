import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { validationConfig as defaultValidationConfig, validateName, validateEmail, validatePassword, validateRegistrationForm } from '../utils/validation';
// import { getPasswordStrength } from '../utils/validation'; // unused
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [fieldValidating, setFieldValidating] = useState<{ [key: string]: boolean }>({});
  const [fieldValid, setFieldValid] = useState<{ [key: string]: boolean }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [dynamicValidationConfig, setDynamicValidationConfig] = useState(defaultValidationConfig);
  const [configLoaded, setConfigLoaded] = useState(false);
  // Fix NodeJS.Timeout type for browser
  const emailCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch dynamic validation config from backend
  useEffect(() => {
    const fetchValidationConfig = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/config/validation');
        const data = await res.json();
        if (data.success && data.data) {
          setDynamicValidationConfig(data.data);
        }
      } catch (err) {
        // fallback to default config
      } finally {
        setConfigLoaded(true);
      }
    };
    fetchValidationConfig();
  }, []);

  // Validate on every keystroke
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const trimmedValue = value.trim();
    // If value contains any space, trigger error
    if (value.includes(' ')) {
      setFieldErrors(prev => ({ ...prev, [name]: 'Spaces are not allowed in this field.' }));
      setFieldValid(prev => ({ ...prev, [name]: false }));
    } else if (trimmedValue === '') {
      setFieldErrors(prev => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1).replace('Name', ' name')} is required` }));
      setFieldValid(prev => ({ ...prev, [name]: false }));
    } else {
      validateField(name, trimmedValue);
    }
    if (error) {
      setError('');
      setErrorType(null);
    }
  };

  // Validate on blur as well, and persist errors until valid
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const trimmedValue = value.trim();
    if (value.includes(' ')) {
      setFieldErrors(prev => ({ ...prev, [name]: 'Spaces are not allowed in this field.' }));
      setFieldValid(prev => ({ ...prev, [name]: false }));
    } else if (trimmedValue === '') {
      setFieldErrors(prev => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1).replace('Name', ' name')} is required` }));
      setFieldValid(prev => ({ ...prev, [name]: false }));
    } else {
      validateField(name, trimmedValue);
    }
  };

  // Enhanced validateField for email existence check
  const validateField = async (fieldName: string, value: string) => {
    setFieldValidating(prev => ({ ...prev, [fieldName]: true }));
    try {
      let validation;
      if (fieldName === 'email') {
        validation = await validateEmail(value, dynamicValidationConfig.email);
        if (validation.isValid) {
          // Debounce API call for email existence
          if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
          emailCheckTimeout.current = setTimeout(async () => {
            try {
              const res = await fetch(`http://localhost:3002/api/auth/check-email?email=${encodeURIComponent(value)}`);
              if (res.ok) {
                const data = await res.json();
                if (data.exists) {
                  setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Please sign in or use a different email.' }));
                  setFieldValid(prev => ({ ...prev, email: false }));
                } else {
                  setFieldErrors(prev => ({ ...prev, email: '' }));
                  setFieldValid(prev => ({ ...prev, email: true }));
                }
              }
            } catch (err) {
              // Network error, do not block user
            } finally {
              setFieldValidating(prev => ({ ...prev, email: false }));
            }
          }, 500); // 500ms debounce
          return;
        }
      } else {
        switch (fieldName) {
          case 'firstName':
            validation = validateName(value, 'First name', dynamicValidationConfig.name);
            break;
          case 'lastName':
            validation = validateName(value, 'Last name', dynamicValidationConfig.name);
            break;
          case 'password':
            validation = validatePassword(value, formData, dynamicValidationConfig.password);
            break;
          case 'confirmPassword':
            validation = {
              isValid: value === formData.password,
              message: value === formData.password ? 'Passwords match' : 'Passwords do not match'
            };
            break;
          default:
            return;
        }
      }
      if (validation) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: validation.isValid ? '' : validation.message }));
        setFieldValid(prev => ({ ...prev, [fieldName]: validation.isValid }));
      }
    } catch (error) {
      console.error('Field validation error:', error);
    } finally {
      if (fieldName !== 'email') setFieldValidating(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Real-time password strength checking
  useEffect(() => {
    if (formData.password) {
      // setPasswordStrength(getPasswordStrength(formData.password)); // This line was removed as per the edit hint
    }
  }, [formData.password]);

  // Real-time password confirmation checking
  useEffect(() => {
    if (formData.confirmPassword && touched.confirmPassword) {
      const isMatch = formData.password === formData.confirmPassword;
      setFieldErrors(prev => ({ 
        ...prev, 
        confirmPassword: isMatch ? '' : 'Passwords do not match' 
      }));
      setFieldValid(prev => ({ 
        ...prev, 
        confirmPassword: isMatch 
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword]);

  // Helper component for field validation indicator
  const FieldValidationIndicator = ({ fieldName }: { fieldName: string }) => {
    if (fieldValidating[fieldName]) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (fieldValid[fieldName]) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (fieldErrors[fieldName] && touched[fieldName]) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType(null);
    // Use dynamic validation config
    const validation = await validateRegistrationForm(formData, dynamicValidationConfig);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
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

  // Disable submit if config not loaded or any field invalid
  const isFormInvalid =
    !configLoaded ||
    Object.values(fieldValid).some(valid => valid === false) ||
    Object.keys(fieldValid).length < 5 || // not all fields validated yet
    Object.values(fieldValidating).some(Boolean);


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
                <div className="relative">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`w-full px-4 py-3 pr-12 bg-[#2a2a2a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      fieldErrors.firstName && touched.firstName
                        ? 'border-red-500 focus:ring-red-500'
                        : fieldValid.firstName
                        ? 'border-green-500 focus:ring-[#1db954]'
                        : 'border-[#404040] focus:ring-[#1db954]'
                    }`}
                    placeholder="First name"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FieldValidationIndicator fieldName="firstName" />
                  </div>
                </div>
                {fieldErrors.firstName && touched.firstName && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`w-full px-4 py-3 pr-12 bg-[#2a2a2a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      fieldErrors.lastName && touched.lastName
                        ? 'border-red-500 focus:ring-red-500'
                        : fieldValid.lastName
                        ? 'border-green-500 focus:ring-[#1db954]'
                        : 'border-[#404040] focus:ring-[#1db954]'
                    }`}
                    placeholder="Last name"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FieldValidationIndicator fieldName="lastName" />
                  </div>
                </div>
                {fieldErrors.lastName && touched.lastName && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#2a2a2a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    fieldErrors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500'
                      : fieldValid.email
                      ? 'border-green-500 focus:ring-[#1db954]'
                      : 'border-[#404040] focus:ring-[#1db954]'
                  }`}
                  placeholder="Email address"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FieldValidationIndicator fieldName="email" />
                </div>
              </div>
              {fieldErrors.email && touched.email && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#2a2a2a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    fieldErrors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500'
                      : fieldValid.password
                      ? 'border-green-500 focus:ring-[#1db954]'
                      : 'border-[#404040] focus:ring-[#1db954]'
                  }`}
                  placeholder="Password"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FieldValidationIndicator fieldName="password" />
                </div>
              </div>
              {fieldErrors.password && touched.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#2a2a2a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    fieldErrors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : fieldValid.confirmPassword
                      ? 'border-green-500 focus:ring-[#1db954]'
                      : 'border-[#404040] focus:ring-[#1db954]'
                  }`}
                  placeholder="Confirm password"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FieldValidationIndicator fieldName="confirmPassword" />
                </div>
              </div>
              {fieldErrors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isFormInvalid || isLoading}
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