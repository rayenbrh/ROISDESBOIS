import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { Invoice, PaymentFormData, ApiResponse, PaginatedResponse, InvoiceFilters } from '../../types';

// Get all invoices with filters
export const useInvoices = (filters?: InvoiceFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['invoices', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isPaid !== undefined) params.append('isPaid', String(filters.isPaid));
      if (filters?.client) params.append('client', filters.client);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Invoice>>>(
        `/invoices?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get single invoice
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Invoice>>(`/admin/invoices/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Add payment to invoice
export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, payment }: { invoiceId: string; payment: PaymentFormData }) => {
      const response = await apiClient.post<ApiResponse<Invoice>>(
        `/admin/invoices/${invoiceId}/payments`,
        payment
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
    },
  });
};

// Mark invoice as paid
export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiClient.put<ApiResponse<Invoice>>(
        `/admin/invoices/${invoiceId}/mark-paid`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data._id] });
    },
  });
};

// Download invoice PDF
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiClient.get(`/admin/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

// Delete invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
