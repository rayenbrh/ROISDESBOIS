import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { uploadFiles } from '../api';
import { SubProduct, SubProductFormData, ApiResponse, PaginatedResponse } from '../../types';

// Get all subproducts with pagination
export const useSubProducts = (page = 1, limit = 20, search?: string) => {
  return useQuery({
    queryKey: ['subProducts', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);

      const response = await apiClient.get<ApiResponse<PaginatedResponse<SubProduct>>>(
        `/subproducts?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get single subproduct
export const useSubProduct = (id: string) => {
  return useQuery({
    queryKey: ['subProduct', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SubProduct>>(`/admin/subproducts/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create subproduct mutation
export const useCreateSubProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubProductFormData) => {
      // Upload images
      const imageUrls = await uploadFiles(data.images, 'image');

      const payload = {
        title: data.title,
        SKU: data.SKU,
        extraPrice: data.extraPrice,
        stock: data.stock,
        images: imageUrls,
      };

      const response = await apiClient.post<ApiResponse<SubProduct>>('/admin/subproducts', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subProducts'] });
    },
  });
};

// Update subproduct mutation
export const useUpdateSubProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubProductFormData> }) => {
      let imageUrls: string[] | undefined;

      // Upload new images if provided
      if (data.images && data.images.length > 0) {
        imageUrls = await uploadFiles(data.images, 'image');
      }

      const payload = {
        ...data,
        images: imageUrls || data.images,
      };

      const response = await apiClient.put<ApiResponse<SubProduct>>(`/admin/subproducts/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subProducts'] });
      queryClient.invalidateQueries({ queryKey: ['subProduct', variables.id] });
    },
  });
};

// Delete subproduct mutation
export const useDeleteSubProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/subproducts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subProducts'] });
    },
  });
};

// Update subproduct stock
export const useUpdateSubProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const response = await apiClient.put<ApiResponse<SubProduct>>(`/admin/subproducts/${id}`, { stock });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subProducts'] });
      queryClient.invalidateQueries({ queryKey: ['subProduct', variables.id] });
    },
  });
};
