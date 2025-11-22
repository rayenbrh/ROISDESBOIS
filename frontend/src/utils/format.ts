import { format as dateFnsFormat, formatDistance, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

// Format currency in Arabic
export const formatCurrency = (amount: number, currency = 'دج'): string => {
  const formatted = new Intl.NumberFormat('ar-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
};

// Format number in Arabic
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-DZ').format(num);
};

// Format date in Arabic
export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: ar });
};

// Format date and time in Arabic
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, 'dd/MM/yyyy HH:mm', { locale: ar });
};

// Format relative time in Arabic (e.g., "منذ ساعتين")
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ar });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format percentage
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}٪`;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
