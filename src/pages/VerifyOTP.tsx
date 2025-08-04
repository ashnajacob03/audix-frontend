import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomAuth } from '../contexts/AuthContext';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCustomAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get user data from navigation state
  const userData = location.state?.userData;
  const userEmail = userData?.email;

  useEffect(() => {
    // Redirect to signup if no user data
    if (!userData || !userEmail) {
      navigate('/signup', { replace: true });
      return;
    }
  }, [userData, userEmail, navigate]);

  useEffect(() => {
    // Countdown for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Success! Show success message and redirect to login
      alert('✅ Email verified successfully! You can now login with your credentials.');
      navigate('/login', { replace: true });
      
    } catch (err: any) {
      console.error('OTP verification error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Backend server is not running. Please start the backend server.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // Clear current OTP and start cooldown
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60); // 60 seconds cooldown
      
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();

    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!userData || !userEmail) {
    return null; // Will redirect in useEffect
  }

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
          <h1 className="text-4xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-[#1db954] font-medium">{userEmail}</p>
        </div>

        {/* Verification Form */}
        <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828]">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#2a2a2a] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isResending || resendCooldown > 0}
              className="text-[#1db954] hover:text-[#1ed760] font-medium transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isResending 
                ? 'Sending...' 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'
              }
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
            <p className="text-gray-400 text-xs text-center">
              💡 The verification code will expire in 10 minutes. 
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </div>

        {/* Back to Signup */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/signup')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;