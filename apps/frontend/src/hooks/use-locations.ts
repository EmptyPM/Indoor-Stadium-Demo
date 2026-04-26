import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export interface Location { id: string; name: string; province?: string; isActive: boolean; _count?: { stadiums: number }; createdAt: string; }

export function useLocations(search?: string) {
  return useQuery<Location[]>({
    queryKey: ['locations', search],
    queryFn: async () => { const { data } = await api.get('/locations', { params: { search } }); return data; },
  });
}

export function useLocation(id: string) {
  return useQuery<Location>({
    queryKey: ['location', id],
    queryFn: async () => { const { data } = await api.get(`/locations/${id}`); return data; },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; province?: string }) => { const { data } = await api.post('/locations', dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create location'),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; name?: string; province?: string; isActive?: boolean }) => { const { data } = await api.patch(`/locations/${id}`, dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update location'),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/locations/${id}`); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete location'),
  });
}
