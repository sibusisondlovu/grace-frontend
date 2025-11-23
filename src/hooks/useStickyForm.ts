import { useState, useEffect, useCallback } from 'react';

interface StickyFormOptions {
  key: string;
  clearOnSuccess?: boolean;
  defaultValues?: Record<string, any>;
}

export function useStickyForm<T extends Record<string, any>>(options: StickyFormOptions) {
  const { key, clearOnSuccess = true, defaultValues = {} } = options;
  const [formData, setFormData] = useState<T>(defaultValues as T);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`cms-form-${key}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({ ...defaultValues, ...parsedData } as T);
      } catch (error) {
        console.warn('Failed to parse saved form data:', error);
      }
    }
  }, [key]);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(`cms-form-${key}`, JSON.stringify(formData));
    }
  }, [formData, key]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const clearForm = useCallback(() => {
    setFormData(defaultValues as T);
    localStorage.removeItem(`cms-form-${key}`);
  }, [key, defaultValues]);

  const handleSuccess = useCallback(() => {
    if (clearOnSuccess) {
      clearForm();
    }
  }, [clearOnSuccess, clearForm]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: formData[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateField(field, e.target.value);
    }
  }), [formData, updateField]);

  const getSelectProps = useCallback((field: keyof T) => ({
    value: formData[field] || '',
    onValueChange: (value: string) => {
      updateField(field, value);
    }
  }), [formData, updateField]);

  const getCheckboxProps = useCallback((field: keyof T) => ({
    checked: formData[field] || false,
    onCheckedChange: (checked: boolean) => {
      updateField(field, checked);
    }
  }), [formData, updateField]);

  return {
    formData,
    updateField,
    updateMultipleFields,
    clearForm,
    handleSuccess,
    getFieldProps,
    getSelectProps,
    getCheckboxProps
  };
}