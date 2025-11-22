import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { uploadFile } from '../api';
import { Settings, SettingsFormData, ApiResponse } from '../../types';

// Get settings
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Settings>>('/admin/settings');
      return response.data.data;
    },
  });
};

// Update settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      let logoUrl: string | undefined;

      // Upload logo if provided
      if (data.logo && data.logo instanceof File) {
        logoUrl = await uploadFile(data.logo, 'image');
      }

      const payload = {
        ...data,
        logo: logoUrl || data.logo,
      };

      const response = await apiClient.put<ApiResponse<Settings>>('/admin/settings', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
