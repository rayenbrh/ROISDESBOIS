import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { uploadFiles } from '../api';
import { Product, ProductFormData, ApiResponse, PaginatedResponse, ProductFilters, CompositeJobStatus } from '../../types';

// Get all products with filters
export const useProducts = (filters?: ProductFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['products', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categories && filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('categories', cat));
      }
      if (filters?.isSpecial !== undefined) params.append('isSpecial', String(filters.isSpecial));
      if (filters?.stockStatus) params.append('stockStatus', filters.stockStatus);
      if (filters?.search) params.append('search', filters.search);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
        `/products?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Upload images
      const imageUrls = data.images.length > 0 ? await uploadFiles(data.images, 'image') : [];

      const payload = {
        title: data.title,
        description: data.description,
        SKU: data.SKU,
        retailPrice: data.retailPrice,
        costPrice: data.costPrice,
        bulkPrices: data.bulkPrices,
        stock: data.stock,
        stockPolicy: data.stockPolicy,
        categories: data.categories,
        images: imageUrls,
        isSpecial: data.isSpecial,
        componentGroups: data.componentGroups,
        combinationImages: data.combinationImages,
        isActive: data.isActive,
      };

      const response = await apiClient.post<ApiResponse<Product>>('/products', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      let imageUrls: string[] | undefined;

      // Upload new images if provided
      if (data.images && data.images.length > 0 && data.images[0] instanceof File) {
        imageUrls = await uploadFiles(data.images as File[], 'image');
      }

      const payload = {
        ...data,
        images: imageUrls || data.images,
      };

      const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Generate composite image
export const useGenerateComposite = () => {
  return useMutation({
    mutationFn: async (data: { productId: string; combination: Record<string, string> }) => {
      const response = await apiClient.post<ApiResponse<{ jobId: string }>>(
        `/products/${data.productId}/generate-composite`,
        { combination: data.combination }
      );
      return response.data.data;
    },
  });
};

// Check composite job status
export const useCompositeJobStatus = (jobId: string, enabled = false) => {
  return useQuery({
    queryKey: ['compositeJob', jobId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CompositeJobStatus>>(`/jobs/${jobId}`);
      return response.data.data;
    },
    enabled: enabled && !!jobId,
    refetchInterval: (data) => {
      // Stop polling if job is completed or failed
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
};

// Get low stock products
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Product[]>>('/products/analytics/low-stock');
      return response.data.data;
    },
  });
};
