import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;

          // Update token in store
          useAuthStore.getState().setToken(token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Backend sends errors in format: { success: false, error: { code, message } }
    const message = error.response?.data?.error?.message || error.response?.data?.message;
    if (message) return message;

    if (error.response?.status === 404) return 'المورد غير موجود';
    if (error.response?.status === 403) return 'ليس لديك صلاحية للقيام بهذا الإجراء';
    if (error.response?.status === 500) return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
    if (error.code === 'ECONNABORTED') return 'انتهت مهلة الطلب';
    if (error.message === 'Network Error') return 'خطأ في الاتصال بالشبكة';
  }

  return 'حدث خطأ غير متوقع';
};

// Helper function to upload files
export const uploadFile = async (file: File, type: 'image' | 'document' = 'image'): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/admin/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Backend returns { path, thumbPath, width, height }
  return response.data.data.path;
};

// Helper function to upload multiple files
export const uploadFiles = async (files: File[], type: 'image' | 'document' = 'image'): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await apiClient.post('/admin/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Backend returns array of { path, thumbPath, width, height }
  return response.data.data.map((img: any) => img.path);
};

export default apiClient;
