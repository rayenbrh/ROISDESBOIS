import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';
import { SalesStats, TopProduct, TopClient, CategoryStats, ApiResponse } from '../../types';

// Get sales statistics
export const useSalesStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['salesStats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<ApiResponse<SalesStats>>(
        `/analytics/sales?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get top products
export const useTopProducts = (limit = 10, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['topProducts', limit, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<ApiResponse<TopProduct[]>>(
        `/analytics/top-products?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get top clients
export const useTopClients = (limit = 10, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['topClients', limit, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<ApiResponse<TopClient[]>>(
        `/analytics/top-clients?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get category distribution
export const useCategoryStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['categoryStats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<ApiResponse<CategoryStats[]>>(
        `/analytics/categories?${params.toString()}`
      );
      return response.data.data;
    },
  });
};
