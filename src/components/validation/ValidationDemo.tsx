import React, { useState } from 'react';
import { EnhancedValidationInput, PasswordStrengthIndicator, FormErrorAlert } from './index';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePasswordConfirmation,
  calculatePasswordStrength 
} from '../../utils/validation';
import { useFormValidation } from '../../hooks/useFormValidation';

const ValidationDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(''));
  const [showDemo, setShowDemo] = useState(false);

  const validationRules = {
    firstName: {
      validator: (value: string) => validateName(value, 'First name'),
      required: true,
      debounceMs: 300
    },
    lastName: {
      validator: (value: string) => validateName(value, 'Last name'),
      required: true,
      debounceMs: 300
    },
    email: {
      validator: validateEmail,
      required: true,
      debounceMs: 400
    },
    password: {
      validator: validatePassword,
      required: true,
      debounceMs: 500
    },
    confirmPassword: {
      validator: (value: string, formData: any) => 
        validatePasswordConfirmation(formData?.password || '', value),
      required: true,
      debounceMs: 300
    }
  };

  const {
    validationState,
    validateField,
    isFormValid,
    hasErrors,
    resetValidation
  } = useFormValidation(validationRules);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Validate field
    validateField(name, value, newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      alert('Form is valid! Ready to submit.');
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setPasswordStrength(calculatePasswordStrength(''));
    resetValidation();
  };

  if (!showDemo) {
    return (
      <div className="p-8 bg-[#121212] rounded-2xl border border-[#282828] max-w-md mx-auto">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Validation Demo</h3>
          <p className="text-gray-400 text-sm">
            See the professional validation system in action
          </p>
          <button
            onClick={() => setShowDemo(true)}
            className="bg-[#1db954] hover:bg-[#1ed760] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Show Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Professional Form Validation</h2>
        <p className="text-gray-400">
          Real-time validation with professional UI/UX
        </p>
      </div>

      {/* Form Status */}
      <div className="bg-[#121212] rounded-lg p-4 border border-[#282828]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isFormValid ? 'bg-green-500' : hasErrors ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <span className="text-sm font-medium text-white">
              Form Status: {isFormValid ? 'Valid' : hasErrors ? 'Has Errors' : 'Incomplete'}
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* Demo Form */}
      <div className="bg-[#121212] rounded-2xl p-8 border border-[#282828]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedValidationInput
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
              validator={(value) => validateName(value, 'First name')}
              validationResult={validationState.firstName.touched ? {
                isValid: validationState.firstName.isValid,
                message: validationState.firstName.message,
                severity: validationState.firstName.severity
              } : null}
              isValidating={validationState.firstName.isValidating}
              required
              autoComplete="given-name"
            />

            <EnhancedValidationInput
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              validator={(value) => validateName(value, 'Last name')}
              validationResult={validationState.lastName.touched ? {
                isValid: validationState.lastName.isValid,
                message: validationState.lastName.message,
                severity: validationState.lastName.severity
              } : null}
              isValidating={validationState.lastName.isValidating}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email Field */}
          <EnhancedValidationInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            validator={validateEmail}
            validationResult={validationState.email.touched ? {
              isValid: validationState.email.isValid,
              message: validationState.email.message,
              severity: validationState.email.severity
            } : null}
            isValidating={validationState.email.isValidating}
            required
            autoComplete="email"
          />

          {/* Password Field with Strength Indicator */}
          <div className="space-y-3">
            <EnhancedValidationInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              validator={validatePassword}
              validationResult={validationState.password.touched ? {
                isValid: validationState.password.isValid,
                message: validationState.password.message,
                severity: validationState.password.severity
              } : null}
              isValidating={validationState.password.isValidating}
              required
              autoComplete="new-password"
              showPasswordToggle
            />

            <PasswordStrengthIndicator
              strength={passwordStrength}
              password={formData.password}
              showFeedback={true}
            />
          </div>

          {/* Confirm Password Field */}
          <EnhancedValidationInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            validator={(value) => validatePasswordConfirmation(formData.password, value)}
            validationResult={validationState.confirmPassword.touched ? {
              isValid: validationState.confirmPassword.isValid,
              message: validationState.confirmPassword.message,
              severity: validationState.confirmPassword.severity
            } : null}
            isValidating={validationState.confirmPassword.isValidating}
            required
            autoComplete="new-password"
            showPasswordToggle
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 
              transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212]
              ${!isFormValid
                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                : 'bg-[#1db954] hover:bg-[#1ed760] hover:scale-[1.02] text-white focus:ring-[#1db954]'
              }
            `}
          >
            {isFormValid ? '✓ Submit Form' : 'Complete Form to Submit'}
          </button>
        </form>
      </div>

      {/* Features List */}
      <div className="bg-[#121212] rounded-lg p-6 border border-[#282828]">
        <h3 className="text-lg font-semibold text-white mb-4">Validation Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Real-time validation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Password strength indicator</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Debounced validation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Professional animations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Accessibility support</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-300">Contextual error messages</span>
          </div>
        </div>
      </div>

      {/* Close Demo */}
      <div className="text-center">
        <button
          onClick={() => setShowDemo(false)}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Close Demo
        </button>
      </div>
    </div>
  );
};

export default ValidationDemo;