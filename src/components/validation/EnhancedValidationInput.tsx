import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { ValidationResult } from '../../utils/validation';

interface EnhancedValidationInputProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidation?: (result: ValidationResult) => void;
  validator?: (value: string) => ValidationResult;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  showPasswordToggle?: boolean;
  className?: string;
  isValidating?: boolean;
  validationResult?: ValidationResult | null;
  showSuccessAnimation?: boolean;
}

const EnhancedValidationInput: React.FC<EnhancedValidationInputProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  onValidation,
  validator,
  required = false,
  disabled = false,
  autoComplete,
  showPasswordToggle = false,
  className = '',
  isValidating = false,
  validationResult = null,
  showSuccessAnimation = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show success animation when validation becomes successful
  useEffect(() => {
    if (validationResult?.isValid && validationResult.severity === 'success' && hasBeenTouched && showSuccessAnimation) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [validationResult, hasBeenTouched, showSuccessAnimation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (!hasBeenTouched) {
      setHasBeenTouched(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
    if (validator && onValidation) {
      const result = validator(value);
      onValidation(result);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }

    if (!validationResult || !hasBeenTouched) return null;

    switch (validationResult.severity) {
      case 'success':
        return (
          <CheckCircle 
            className={`w-5 h-5 text-green-500 transition-all duration-300 ${
              showSuccess ? 'scale-110 drop-shadow-lg' : ''
            }`} 
          />
        );
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getInputBorderClass = () => {
    const baseClasses = 'border transition-all duration-300';
    
    if (isValidating) {
      return `${baseClasses} border-blue-500 ring-2 ring-blue-500/20`;
    }

    if (!hasBeenTouched) {
      return isFocused 
        ? `${baseClasses} border-[#1db954] ring-2 ring-[#1db954]/20 shadow-lg shadow-[#1db954]/10` 
        : `${baseClasses} border-[#404040]`;
    }

    if (!validationResult) {
      return isFocused 
        ? `${baseClasses} border-[#1db954] ring-2 ring-[#1db954]/20 shadow-lg shadow-[#1db954]/10` 
        : `${baseClasses} border-[#404040]`;
    }

    switch (validationResult.severity) {
      case 'success':
        return isFocused 
          ? `${baseClasses} border-green-500 ring-2 ring-green-500/20 shadow-lg shadow-green-500/10` 
          : `${baseClasses} border-green-500/50`;
      case 'warning':
        return isFocused 
          ? `${baseClasses} border-yellow-500 ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10` 
          : `${baseClasses} border-yellow-500/50`;
      case 'error':
        return isFocused 
          ? `${baseClasses} border-red-500 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10` 
          : `${baseClasses} border-red-500/50`;
      default:
        return isFocused 
          ? `${baseClasses} border-[#1db954] ring-2 ring-[#1db954]/20 shadow-lg shadow-[#1db954]/10` 
          : `${baseClasses} border-[#404040]`;
    }
  };

  const getValidationMessageClass = () => {
    if (!validationResult || !hasBeenTouched) return 'text-gray-400';

    const baseClasses = 'transition-all duration-300';

    switch (validationResult.severity) {
      case 'success':
        return `${baseClasses} text-green-400`;
      case 'warning':
        return `${baseClasses} text-yellow-400`;
      case 'error':
        return `${baseClasses} text-red-400 animate-in slide-in-from-left-2`;
      default:
        return `${baseClasses} text-gray-400`;
    }
  };

  const getLabelClass = () => {
    const baseClasses = 'block text-sm font-medium transition-colors duration-200';
    
    if (isFocused) {
      return `${baseClasses} text-[#1db954]`;
    }
    
    if (validationResult && hasBeenTouched) {
      switch (validationResult.severity) {
        case 'success':
          return `${baseClasses} text-green-400`;
        case 'warning':
          return `${baseClasses} text-yellow-400`;
        case 'error':
          return `${baseClasses} text-red-400`;
        default:
          return `${baseClasses} text-gray-300`;
      }
    }
    
    return `${baseClasses} text-gray-300`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={id} className={getLabelClass()}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {isValidating && (
          <span className="ml-2 text-xs text-blue-400 animate-pulse">
            Validating...
          </span>
        )}
      </label>

      {/* Input Container */}
      <div className="relative group">
        <input
          ref={inputRef}
          type={getInputType()}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pr-12 bg-[#2a2a2a] rounded-lg text-white 
            placeholder-gray-500 focus:outline-none disabled:opacity-50 
            disabled:cursor-not-allowed transform transition-all duration-300
            hover:bg-[#2f2f2f] focus:bg-[#2f2f2f]
            ${getInputBorderClass()}
            ${showSuccess ? 'animate-pulse' : ''}
          `}
          aria-describedby={validationResult && hasBeenTouched ? `${id}-validation` : undefined}
          aria-invalid={validationResult && !validationResult.isValid && hasBeenTouched ? true : false}
        />

        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Validation icon */}
          <div className="transition-all duration-300">
            {getValidationIcon()}
          </div>
          
          {/* Password toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:text-gray-300 p-1 rounded-md hover:bg-gray-700/50"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Focus ring animation */}
        {isFocused && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#1db954]/10 to-transparent animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Validation Message */}
      {validationResult && hasBeenTouched && validationResult.message && (
        <div 
          id={`${id}-validation`}
          className={`text-xs font-medium ${getValidationMessageClass()}`}
          role={validationResult.severity === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <div className="flex items-start space-x-1">
            <span className="flex-1">{validationResult.message}</span>
            {validationResult.severity === 'success' && showSuccess && (
              <span className="text-green-400 animate-bounce">✓</span>
            )}
          </div>
        </div>
      )}

      {/* Character count for password fields */}
      {type === 'password' && value && (
        <div className="text-xs text-gray-500 text-right">
          {value.length} characters
        </div>
      )}
    </div>
  );
};

export default EnhancedValidationInput;