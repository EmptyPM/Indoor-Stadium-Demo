import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export interface Sport { id: string; name: string; icon?: string; description?: string; isActive: boolean; _count?: { courts: number }; createdAt: string; }

export function useSports(search?: string) {
  return useQuery<Sport[]>({
    queryKey: ['sports', search],
    queryFn: async () => { const { data } = await api.get('/sports', { params: { search } }); return data; },
  });
}

export function useSport(id: string) {
  return useQuery<Sport>({
    queryKey: ['sport', id],
    queryFn: async () => { const { data } = await api.get(`/sports/${id}`); return data; },
    enabled: !!id,
  });
}

export function useCreateSport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; icon?: string; description?: string }) => { const { data } = await api.post('/sports', dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sports'] }); toast.success('Sport created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create sport'),
  });
}

export function useUpdateSport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; name?: string; icon?: string; description?: string; isActive?: boolean }) => { const { data } = await api.patch(`/sports/${id}`, dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sports'] }); toast.success('Sport updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update sport'),
  });
}

export function useDeleteSport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/sports/${id}`); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sports'] }); toast.success('Sport deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete sport'),
  });
}
