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
        title: { ar: data.title },
        description: { ar: data.description },
        sku: data.SKU,
        price: {
          retail: data.retailPrice,
          bulkPrices: data.bulkPrices.map(bp => ({
            minQty: bp.minQty,
            price: bp.price
          }))
        },
        cost: data.costPrice,
        stock: {
          qty: data.stock,
          policy: data.stockPolicy
        },
        categories: data.categories,
        images: imageUrls.map(url => ({
          path: url,
          thumbPath: url,
          alt: { ar: data.title }
        })),
        isSpecial: data.isSpecial,
        specialConfig: data.isSpecial && data.componentGroups ? {
          mode: 'component_based',
          componentGroups: data.componentGroups
        } : undefined,
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

      const payload: any = {};

      if (data.title) payload.title = { ar: data.title };
      if (data.description) payload.description = { ar: data.description };
      if (data.SKU) payload.sku = data.SKU;
      if (data.retailPrice !== undefined) {
        payload.price = payload.price || {};
        payload.price.retail = data.retailPrice;
      }
      if (data.costPrice !== undefined) {
        payload.cost = data.costPrice;
      }
      if (data.bulkPrices) {
        payload.price = payload.price || {};
        payload.price.bulkPrices = data.bulkPrices.map(bp => ({
          minQty: bp.minQty,
          price: bp.price
        }));
      }
      if (data.stock !== undefined) {
        payload.stock = payload.stock || {};
        payload.stock.qty = data.stock;
      }
      if (data.stockPolicy) {
        payload.stock = payload.stock || {};
        payload.stock.policy = data.stockPolicy;
      }
      if (data.categories) payload.categories = data.categories;
      if (imageUrls) {
        payload.images = imageUrls.map((url: string) => ({
          path: url,
          thumbPath: url,
          alt: { ar: data.title || '' }
        }));
      }
      if (data.isSpecial !== undefined) payload.isSpecial = data.isSpecial;
      if (data.componentGroups) {
        payload.specialConfig = {
          mode: 'component_based',
          componentGroups: data.componentGroups
        };
      }
      if (data.isActive !== undefined) payload.isActive = data.isActive;

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
