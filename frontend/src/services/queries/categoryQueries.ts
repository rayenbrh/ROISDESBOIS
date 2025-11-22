import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { uploadFile } from '../api';
import { Category, CategoryFormData, ApiResponse } from '../../types';

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
      return response.data.data;
    },
  });
};

// Get single category
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category>>(`/admin/categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      let iconUrl: string | undefined;

      // Upload icon if provided
      if (data.icon) {
        iconUrl = await uploadFile(data.icon, 'image');
      }

      const payload = {
        name: { ar: data.name },
        slug: data.slug,
        parentId: data.parentCategory,
        icon: iconUrl,
      };

      const response = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      let iconUrl: string | undefined;

      // Upload icon if provided
      if (data.icon && data.icon instanceof File) {
        iconUrl = await uploadFile(data.icon, 'image');
      }

      const payload: any = {
        slug: data.slug,
        parentId: data.parentCategory,
        icon: iconUrl || data.icon,
      };

      if (data.name) {
        payload.name = { ar: data.name };
      }

      const response = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
