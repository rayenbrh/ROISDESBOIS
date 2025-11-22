import { useQuery } from '@tanstack/react-query';
import apiClient from '../api';
import { AuditLog, ApiResponse, PaginatedResponse, AuditLogFilters } from '../../types';

// Get audit logs with filters
export const useAuditLogs = (filters?: AuditLogFilters, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['auditLogs', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.user) params.append('user', filters.user);
      if (filters?.actionType) params.append('actionType', filters.actionType);
      if (filters?.resourceType) params.append('resourceType', filters.resourceType);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(
        `/audit-logs?${params.toString()}`
      );
      return response.data.data;
    },
  });
};
