/**
 * Comprehensive validation utilities for registration and forms
 */

// Interface for validation results
export interface ValidationResult {
  isValid: boolean;
  message: string;
  field?: string;
}

// Interface for form validation results
export interface FormValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Dynamic validation config
export const validationConfig = {
  name: {
    minLength: 3,
    maxLength: 30,
    allowedPattern: /^[a-zA-Z\s\-']+$/,
    noNumbers: true,
    noConsecutiveSpecial: true,
  },
  email: {
    blockDisposable: true,
    disposableDomains: [
      'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com'
    ],
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireLower: true,
    requireUpper: true,
    requireNumber: true,
    requireSpecial: true,
    blockCommon: true,
  },
};

/**
 * Validate email format and domain existence
 */
export const validateEmail = async (email: string, config = validationConfig.email) => {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { isValid: false, message: 'Email is required', field: 'email' };
  }
  // Strict email validation regex
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Invalid email address', field: 'email' };
  }
  
  // Additional strict validation rules
  const [localPart] = trimmedEmail.split('@');
  
  // Local part (before @) validation
  if (localPart.length < 2) {
    return { isValid: false, message: 'Email username must be at least 2 characters long', field: 'email' };
  }
  if (localPart.length > 64) {
    return { isValid: false, message: 'Email username cannot exceed 64 characters', field: 'email' };
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: 'Email username cannot start or end with a dot', field: 'email' };
  }
  if (localPart.includes('..')) {
    return { isValid: false, message: 'Email username cannot contain consecutive dots', field: 'email' };
  }
  // Block disposable domains
  if (config.blockDisposable) {
    const domain = trimmedEmail.split('@')[1];
    if (config.disposableDomains.some(d => domain.endsWith(d))) {
      return { isValid: false, message: 'Disposable email addresses are not allowed', field: 'email' };
    }
  }
  // Enhanced: Only allow common TLDs and block typo domains
  const commonTlds = [
    'com', 'in', 'net', 'org', 'edu', 'gov', 'co', 'io', 'me', 'us', 'uk', 'ca', 'au', 'info', 'biz', 'dev', 'app', 'xyz', 'pro', 'tech', 'ai', 'id', 'sg', 'za', 'fr', 'de', 'es', 'it', 'nl', 'ru', 'jp', 'kr', 'br', 'mx', 'ar', 'ch', 'se', 'no', 'fi', 'pl', 'tr', 'ir', 'pk', 'bd', 'lk', 'np', 'my', 'ph', 'vn', 'th', 'hk', 'tw', 'cn', 'sa', 'ae', 'qa', 'il', 'cz', 'sk', 'gr', 'pt', 'ro', 'hu', 'dk', 'be', 'at', 'ie', 'nz'
  ];
  const knownTypos = [
    'gma.com', 'gnail.com', 'gamil.com', 'gmal.com', 'gmial.com', 'yaho.com', 'yhoo.com', 'hotmial.com', 'hotmal.com', 'outlok.com', 'outllok.com', 'icloud.co', 'icloud.om', 'gmai.com', 'gmail.con', 'gmail.co', 'gmail.cmo', 'yahho.com', 'yahool.com', 'yahooo.com', 'yaho.co', 'hotmail.co', 'hotmail.con', 'outlook.co', 'outlook.con', 'protonmail.co', 'protonmail.con', 'zoho.co', 'zoho.con'
  ];
  const [_, domainPart] = trimmedEmail.split('@');
  if (!domainPart) {
    return { isValid: false, message: 'Invalid email address', field: 'email' };
  }
  
  // Domain part validation
  if (domainPart.length < 4) {
    return { isValid: false, message: 'Email domain must be at least 4 characters long', field: 'email' };
  }
  if (domainPart.length > 253) {
    return { isValid: false, message: 'Email domain cannot exceed 253 characters', field: 'email' };
  }
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return { isValid: false, message: 'Email domain cannot start or end with a dot', field: 'email' };
  }
  if (domainPart.includes('..')) {
    return { isValid: false, message: 'Email domain cannot contain consecutive dots', field: 'email' };
  }
  
  const domainLower = domainPart.toLowerCase();
  if (knownTypos.includes(domainLower)) {
    return { isValid: false, message: 'Please enter a valid email address (possible typo in domain)', field: 'email' };
  }
  const tld = domainLower.split('.').pop();
  if (!tld || !commonTlds.includes(tld)) {
    return { isValid: false, message: 'Please enter a valid email address (invalid TLD)', field: 'email' };
  }
  return { isValid: true, message: 'Email is valid', field: 'email' };
};

/**
 * Validate email domain by checking DNS MX records
 */
export const validateEmailDomain = async (domain: string): Promise<boolean> => {
  try {
    // Use a public DNS-over-HTTPS service to check MX records
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json',
      },
    });

    if (!response.ok) {
      throw new Error('DNS lookup failed');
    }

    const data = await response.json();
    
    // Check if MX records exist
    if (data.Answer && data.Answer.length > 0) {
      return true;
    }

    // If no MX records, check for A records (some domains use A records for mail)
    const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json',
      },
    });

    if (aResponse.ok) {
      const aData = await aResponse.json();
      return aData.Answer && aData.Answer.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Domain validation error:', error);
    // If validation fails due to network issues, assume domain is valid
    // to avoid blocking legitimate users
    return true;
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string, formData?: { firstName?: string; lastName?: string; email?: string }, config = validationConfig.password): ValidationResult => {
  if (password.length < config.minLength) {
    return { isValid: false, message: `Password must be at least ${config.minLength} characters long`, field: 'password' };
  }
  if (password.length > config.maxLength) {
    return { isValid: false, message: `Password must be less than ${config.maxLength} characters`, field: 'password' };
  }
  if (config.requireLower && !/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter', field: 'password' };
  }
  if (config.requireUpper && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter', field: 'password' };
  }
  if (config.requireNumber && !/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number', field: 'password' };
  }
  if (config.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)', field: 'password' };
  }
  if (formData) {
    const lower = password.toLowerCase();
    if (formData.firstName && lower.includes(formData.firstName.toLowerCase())) {
      return { isValid: false, message: 'Password cannot contain your first name', field: 'password' };
    }
    if (formData.lastName && lower.includes(formData.lastName.toLowerCase())) {
      return { isValid: false, message: 'Password cannot contain your last name', field: 'password' };
    }
    if (formData.email) {
      const emailPart = formData.email.split('@')[0].toLowerCase();
      if (lower.includes(emailPart)) {
        return { isValid: false, message: 'Password cannot contain your email username', field: 'password' };
      }
    }
  }
  if (config.blockCommon) {
    const commonPasswords = [
      'password', '12345678', 'qwerty123', 'abc123456', 'password123',
      'admin123', 'letmein123', 'welcome123', 'monkey123', '123456789'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { isValid: false, message: 'This password is too common. Please choose a more secure password', field: 'password' };
    }
  }
  return { isValid: true, message: 'Password is strong', field: 'password' };
};

/**
 * Validate name fields
 */
export const validateName = (name: string, fieldName: string, config = validationConfig.name) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { isValid: false, message: `${fieldName} is required`, field: fieldName.toLowerCase() };
  }
  if (trimmedName.length < config.minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${config.minLength} characters long`, field: fieldName.toLowerCase() };
  }
  if (trimmedName.length > config.maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${config.maxLength} characters`, field: fieldName.toLowerCase() };
  }
  if (!config.allowedPattern.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`, field: fieldName.toLowerCase() };
  }
  if (config.noNumbers && /\d/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot contain numbers`, field: fieldName.toLowerCase() };
  }
  if (config.noConsecutiveSpecial && /\s{2,}|[-']{2,}/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot contain consecutive spaces or special characters`, field: fieldName.toLowerCase() };
  }
  return { isValid: true, message: `${fieldName} is valid`, field: fieldName.toLowerCase() };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Please confirm your password',
      field: 'confirmPassword'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match',
      field: 'confirmPassword'
    };
  }

  return {
    isValid: true,
    message: 'Passwords match',
    field: 'confirmPassword'
  };
};

/**
 * Comprehensive form validation for registration
 */
export const validateRegistrationForm = async (
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  config = validationConfig
): Promise<{ isValid: boolean; errors: { [key: string]: string } }> => {
  const errors: { [key: string]: string } = {};
  // Name
  const firstNameValidation = validateName(formData.firstName, 'First name', config.name);
  if (!firstNameValidation.isValid) errors.firstName = firstNameValidation.message;
  const lastNameValidation = validateName(formData.lastName, 'Last name', config.name);
  if (!lastNameValidation.isValid) errors.lastName = lastNameValidation.message;
  // Email
  const emailValidation = await validateEmail(formData.email, config.email);
  if (!emailValidation.isValid) errors.email = emailValidation.message;
  // Password
  const passwordValidation = validatePassword(formData.password, formData, config.password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.message;
  // Confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Get password strength score (0-4)
 */
export const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const strengthMap = {
    0: { label: 'Very Weak', color: 'text-red-500' },
    1: { label: 'Weak', color: 'text-red-400' },
    2: { label: 'Fair', color: 'text-yellow-500' },
    3: { label: 'Good', color: 'text-blue-500' },
    4: { label: 'Strong', color: 'text-green-500' },
    5: { label: 'Very Strong', color: 'text-green-600' }
  };

  return {
    score,
    label: strengthMap[score as keyof typeof strengthMap].label,
    color: strengthMap[score as keyof typeof strengthMap].color
  };
};

export default {
  validateEmail,
  validateEmailDomain,
  validatePassword,
  validateName,
  validatePasswordConfirmation,
  validateRegistrationForm,
  getPasswordStrength
};