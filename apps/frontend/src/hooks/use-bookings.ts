import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Booking {
  id: string; bookingDate: string; startTime: string; endTime: string;
  totalHours: number; totalPrice: number; status: BookingStatus;
  notes?: string; cancelledAt?: string; createdAt: string;
  court?: {
    id: string; name: string; isIndoor: boolean;
    sport?: { id: string; name: string; icon?: string };
    stadium?: { id: string; name: string; location?: { name: string } };
  };
  payment?: { id: string; amount: number; status: PaymentStatus; method: string; paidAt?: string };
}

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: any) => [...bookingKeys.lists(), filters] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  my: (filters?: any) => ['my-bookings', filters] as const,
};

export function useBookings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: async () => {
      const res = await api.get('/bookings', { params });
      return res.data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMyBookings(params?: { page?: number; limit?: number; status?: BookingStatus }) {
  return useQuery<{ data: Booking[]; total: number; totalPages: number; page: number }>({
    queryKey: bookingKeys.my(params),
    queryFn: async () => {
      const { data } = await api.get('/bookings/my', { params });
      return data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      courtId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      notes?: string;
      paymentMethod?: string;
    }) => {
      const res = await api.post('/bookings', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success('Booking confirmed! 🎉');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Booking failed');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.patch(`/bookings/${id}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success('Booking cancelled');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    },
  });
}
