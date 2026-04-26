import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export interface Court {
  id: string; name: string; description?: string; capacity: number; isIndoor: boolean; isActive: boolean; imageUrl?: string;
  openingTime?: string; closingTime?: string;
  stadiumId: string; stadium?: { id: string; name: string; location?: { id: string; name: string } };
  sportId: string; sport?: { id: string; name: string; icon?: string };
  pricings?: any[]; _count?: { bookings: number }; createdAt: string;
}

export function useCourts(params?: { stadiumId?: string; locationId?: string; sportId?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['courts', params],
    queryFn: async () => { const { data } = await api.get('/courts', { params }); return data; },
  });
}

export function useCourtsByStadium(stadiumId: string) {
  return useQuery<Court[]>({
    queryKey: ['courts', 'stadium', stadiumId],
    queryFn: async () => { const { data } = await api.get(`/courts/stadium/${stadiumId}`); return data; },
    enabled: !!stadiumId,
  });
}

export function useCourt(id: string) {
  return useQuery<Court>({
    queryKey: ['court', id],
    queryFn: async () => { const { data } = await api.get(`/courts/${id}`); return data; },
    enabled: !!id,
  });
}

export function useCourtAvailability(courtId: string, date: string) {
  return useQuery({
    queryKey: ['court-availability', courtId, date],
    queryFn: async () => { const { data } = await api.get(`/courts/${courtId}/availability`, { params: { date } }); return data; },
    enabled: !!courtId && !!date,
  });
}

export function useCreateCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => { const { data } = await api.post('/courts', dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courts'] }); toast.success('Court created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create court'),
  });
}

export function useUpdateCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: any) => { const { data } = await api.patch(`/courts/${id}`, dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courts'] }); toast.success('Court updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update court'),
  });
}

export function useDeleteCourt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/courts/${id}`); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courts'] }); toast.success('Court deactivated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete court'),
  });
}
