import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { User, UserFormData, ApiResponse, PaginatedResponse, UserFilters } from '../../types';

// Get all users with filters
export const useUsers = (filters?: UserFilters, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['users', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `/users?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Get commercials (users with role 'commercial')
export const useCommercials = () => {
  return useQuery({
    queryKey: ['commercials'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User[]>>('/admin/users?role=commercial');
      return response.data.data;
    },
  });
};

// Get clients (users with role 'client')
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User[]>>('/admin/users?role=client');
      return response.data.data;
    },
  });
};
