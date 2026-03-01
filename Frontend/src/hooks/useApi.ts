import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

// Custom hooks for data fetching using React Query

export const useListings = (filters?: {
  status?: 'OPEN' | 'FULFILLED' | 'PROOF_PENDING' | 'VERIFIED' | 'RELEASED' | 'DISPUTED';
  category?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const response = await apiService.getListings(filters);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch listings'
        );
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await apiService.getListingById(id);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch listing'
        );
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await apiService.getDashboardStats();
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch dashboard stats'
        );
      }
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
};

export const useUserListings = (pagination?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['userListings', pagination],
    queryFn: async () => {
      const response = await apiService.getUserListings(pagination);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch user listings'
        );
      }
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useUserPurchases = (pagination?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['userPurchases', pagination],
    queryFn: async () => {
      const response = await apiService.getUserPurchases(pagination);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch user purchases'
        );
      }
      return response.data;
    },
    staleTime: 30000,
  });
};

export const usePublicDashboard = (address: string) => {
  return useQuery({
    queryKey: ['publicDashboard', address],
    queryFn: async () => {
      const response = await apiService.getPublicDashboard(address);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string' 
            ? response.error 
            : response.error?.message || 'Failed to fetch user dashboard'
        );
      }
      return response.data;
    },
    enabled: !!address && /^0x[a-fA-F0-9]{40}$/.test(address),
    staleTime: 60000,
  });
};