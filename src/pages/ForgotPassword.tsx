import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [developmentInfo, setDevelopmentInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Forgot password form submitted for email:', email);

    try {
      console.log('Calling ApiService.forgotPassword...');
      const result = await ApiService.forgotPassword(email);
      console.log('Forgot password API response:', result);

      // Handle development mode response
      if (result.data?.developmentMode) {
        setDevelopmentInfo(result.data);
        console.log('🔗 Development Mode - Reset URL:', result.data.resetUrl);
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1db954]/10 to-[#191414] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1db954] rounded-full mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {developmentInfo ? 'Reset Link Generated' : 'Check Your Email'}
            </h1>

            {developmentInfo ? (
              <div className="mb-6">
                <p className="text-gray-400 mb-4">
                  Password reset link generated for <span className="text-white font-medium">{email}</span>
                </p>
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🛠️ Development Mode</p>
                  <p className="text-gray-300 text-xs mb-3">Email not configured. Use this link to reset password:</p>
                  <div className="bg-[#2a2a2a] p-3 rounded border">
                    <a
                      href={developmentInfo.resetUrl}
                      className="text-[#1db954] text-xs break-all hover:text-[#1ed760] transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {developmentInfo.resetUrl}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-400 mb-6">
                  We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setDevelopmentInfo(null);
                }}
                className="w-full bg-[#1db954] hover:bg-[#1ed760] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Try Again
              </button>
              <Link
                to="/login"
                className="block w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1db954]/10 to-[#191414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1db954] rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-400">No worries, we'll send you reset instructions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Forgot Password Form */}
        <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828]">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-[#1db954] hover:text-[#1ed760] font-semibold transition-colors flex items-center justify-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;