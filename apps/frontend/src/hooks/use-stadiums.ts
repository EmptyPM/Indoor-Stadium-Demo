import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export const LOCATIONS = ['Colombo', 'Kandy', 'Galle', 'Kurunegala', 'Matara', 'Negombo', 'Jaffna', 'Ratnapura', 'Other'];

export interface Stadium {
  id: string;
  name: string;
  description?: string;
  locationId: string;
  location?: { id: string; name: string };
  address: string;
  images: string[];
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  managers?: { id: string; name: string; email?: string; phone?: string; role?: string }[];
  courts?: any[];
  _count?: { courts: number };
  createdAt: string;
  updatedAt: string;
}

export interface StadiumsResponse {
  data: Stadium[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useStadiums(params?: {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  sportId?: string;
}) {
  return useQuery<StadiumsResponse>({
    queryKey: ['stadiums', params],
    queryFn: async () => {
      const { data } = await api.get('/stadiums', { params });
      return data;
    },
  });
}

export function useStadium(id: string) {
  return useQuery<Stadium>({
    queryKey: ['stadium', id],
    queryFn: async () => {
      const { data } = await api.get(`/stadiums/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useStadiumLocations() {
  return useQuery<string[]>({
    queryKey: ['stadium-locations'],
    queryFn: async () => {
      const { data } = await api.get('/stadiums/locations');
      return data;
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<Stadium>) => {
      const { data } = await api.post('/stadiums', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      toast.success('Stadium created successfully');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to create stadium');
    },
  });
}

export function useUpdateStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<Stadium> & { id: string }) => {
      const { data } = await api.patch(`/stadiums/${id}`, dto);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      qc.invalidateQueries({ queryKey: ['stadium', vars.id] });
      toast.success('Stadium updated successfully');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to update stadium');
    },
  });
}

export function useDeleteStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/stadiums/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      toast.success('Stadium removed successfully');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to delete stadium');
    },
  });
}

export function useAssignManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stadiumId, managerId }: { stadiumId: string; managerId: string }) => {
      const { data } = await api.patch(`/stadiums/${stadiumId}/assign-manager`, { managerId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      toast.success('Manager assigned successfully');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to assign manager');
    },
  });
}
