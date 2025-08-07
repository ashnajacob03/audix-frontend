import { useState, useCallback, useEffect } from 'react';
import { ValidationResult, debounce } from '../utils/validation';

export interface ValidationRule {
  validator: (value: string, formData?: any) => ValidationResult;
  required?: boolean;
  debounceMs?: number;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface FieldState {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'success';
  touched: boolean;
  isValidating: boolean;
}

export interface FormValidationState {
  [fieldName: string]: FieldState;
}

export interface UseFormValidationReturn {
  validationState: FormValidationState;
  validateField: (fieldName: string, value: string, formData?: any) => void;
  validateAllFields: (formData: any) => boolean;
  isFormValid: boolean;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | null;
  resetValidation: () => void;
  setFieldTouched: (fieldName: string, touched?: boolean) => void;
}

export const useFormValidation = (
  validationRules: ValidationRules
): UseFormValidationReturn => {
  const [validationState, setValidationState] = useState<FormValidationState>(() => {
    const initialState: FormValidationState = {};
    Object.keys(validationRules).forEach(fieldName => {
      initialState[fieldName] = {
        isValid: !validationRules[fieldName].required,
        message: '',
        severity: 'error',
        touched: false,
        isValidating: false
      };
    });
    return initialState;
  });

  // Create debounced validators for each field
  const debouncedValidators = useCallback(() => {
    const validators: { [key: string]: (value: string, formData?: any) => void } = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName];
      validators[fieldName] = debounce((value: string, formData?: any) => {
        const result = rule.validator(value, formData);
        
        setValidationState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            isValid: result.isValid,
            message: result.message,
            severity: result.severity,
            isValidating: false
          }
        }));
      }, rule.debounceMs || 300);
    });
    
    return validators;
  }, [validationRules]);

  const validators = debouncedValidators();

  const validateField = useCallback((fieldName: string, value: string, formData?: any) => {
    if (!validationRules[fieldName]) return;

    // Set validating state
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValidating: true,
        touched: true
      }
    }));

    // Run debounced validation
    validators[fieldName](value, formData);
  }, [validators, validationRules]);

  const validateAllFields = useCallback((formData: any): boolean => {
    let isValid = true;
    const newValidationState = { ...validationState };

    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName];
      const value = formData[fieldName] || '';
      const result = rule.validator(value, formData);

      newValidationState[fieldName] = {
        isValid: result.isValid,
        message: result.message,
        severity: result.severity,
        touched: true,
        isValidating: false
      };

      if (!result.isValid) {
        isValid = false;
      }
    });

    setValidationState(newValidationState);
    return isValid;
  }, [validationRules, validationState]);

  const setFieldTouched = useCallback((fieldName: string, touched: boolean = true) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched
      }
    }));
  }, []);

  const resetValidation = useCallback(() => {
    const resetState: FormValidationState = {};
    Object.keys(validationRules).forEach(fieldName => {
      resetState[fieldName] = {
        isValid: !validationRules[fieldName].required,
        message: '',
        severity: 'error',
        touched: false,
        isValidating: false
      };
    });
    setValidationState(resetState);
  }, [validationRules]);

  const getFieldError = useCallback((fieldName: string): string | null => {
    const field = validationState[fieldName];
    return field && !field.isValid && field.touched ? field.message : null;
  }, [validationState]);

  // Computed values
  const isFormValid = Object.values(validationState).every(field => field.isValid);
  const hasErrors = Object.values(validationState).some(field => !field.isValid && field.touched);

  return {
    validationState,
    validateField,
    validateAllFields,
    isFormValid,
    hasErrors,
    getFieldError,
    resetValidation,
    setFieldTouched
  };
};