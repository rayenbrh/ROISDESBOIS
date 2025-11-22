import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { useAuthStore } from '../../store/authStore';
import { LoginForm, User, ApiResponse } from '../../types';

// Login mutation
export const useLogin = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const response = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
        '/auth/login',
        credentials
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Backend returns accessToken, not token
      // Backend also sets refreshToken as httpOnly cookie
      login(data.user, data.accessToken);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

// Get current user query
export const useCurrentUser = () => {
  const { token, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    },
    enabled: !!token,
    onSuccess: (data) => {
      setUser(data);
    },
  });
};
