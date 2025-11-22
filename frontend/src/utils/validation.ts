// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Algerian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Number validation
export const isValidNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value: number): boolean => {
  return isValidNumber(value) && value > 0;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validation error messages in Arabic
export const validationMessages = {
  required: 'هذا الحقل مطلوب',
  email: 'يرجى إدخال بريد إلكتروني صحيح',
  phone: 'يرجى إدخال رقم هاتف صحيح',
  password: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
  positiveNumber: 'يجب أن يكون الرقم موجباً',
  minLength: (min: number) => `يجب أن يحتوي على ${min} أحرف على الأقل`,
  maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرفاً`,
  min: (min: number) => `القيمة يجب أن تكون ${min} على الأقل`,
  max: (max: number) => `القيمة يجب ألا تتجاوز ${max}`,
  url: 'يرجى إدخال رابط صحيح',
};
