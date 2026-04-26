import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'USER';

export interface UserStadium { id: string; name: string; location?: { id: string; name: string }; }

export interface User {
  id: string; name: string; email: string; phone?: string;
  role: UserRole; isActive: boolean; lastLoginAt?: string; createdAt: string;
  managedStadiums?: UserStadium[];
  _count?: { bookings: number };
}

export interface UsersResponse { data: User[]; total: number; page: number; limit: number; totalPages: number; }

// ── List ─────────────────────────────────────────────────────────────────────
export function useUsers(params?: { page?: number; limit?: number; search?: string; role?: UserRole }) {
  return useQuery<UsersResponse>({
    queryKey: ['users', params],
    queryFn: async () => { const { data } = await api.get('/users', { params }); return data; },
  });
}

export function useUser(id: string) {
  return useQuery<User & { bookings?: any[] }>({
    queryKey: ['user', id],
    queryFn: async () => { const { data } = await api.get(`/users/${id}`); return data; },
    enabled: !!id,
  });
}

export function useManagers() {
  return useQuery<User[]>({
    queryKey: ['managers'],
    queryFn: async () => { const { data } = await api.get('/users/managers'); return data; },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; email: string; password: string; role?: UserRole; phone?: string }) => {
      const { data } = await api.post('/users', dto); return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success(`${d.name} created successfully`); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; name?: string; phone?: string }) => {
      const { data } = await api.patch(`/users/${id}`, dto); return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update user'),
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { data } = await api.patch(`/users/${id}/role`, { role }); return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Role updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update role'),
  });
}

export function useToggleActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const endpoint = active ? `/users/${id}/activate` : `/users/${id}/deactivate`;
      const { data } = await api.patch(endpoint); return data;
    },
    onSuccess: (_, { active }) => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success(active ? 'User activated' : 'User deactivated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Action failed'),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const { data } = await api.patch(`/users/${id}/reset-password`, { password }); return data;
    },
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to reset password'),
  });
}

export function useAssignManagerToStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stadiumId, managerId }: { stadiumId: string; managerId: string }) => {
      const { data } = await api.patch(`/stadiums/${stadiumId}/add-manager`, { managerId }); return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      qc.invalidateQueries({ queryKey: ['stadium'] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to add manager'),
  });
}

export function useRemoveManagerFromStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stadiumId, managerId }: { stadiumId: string; managerId: string }) => {
      const { data } = await api.patch(`/stadiums/${stadiumId}/remove-manager`, { managerId }); return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      qc.invalidateQueries({ queryKey: ['stadium'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Manager removed from stadium');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to remove manager'),
  });
}

// Bulk-assign multiple stadiums to one user
export function useAssignStadiums() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, stadiumIds }: { userId: string; stadiumIds: string[] }) => {
      const { data } = await api.patch(`/users/${userId}/assign-stadiums`, { stadiumIds }); return data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${d.stadiums?.length ?? 0} stadiums assigned to ${d.name}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to assign stadiums'),
  });
}
