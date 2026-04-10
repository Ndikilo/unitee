import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  opportunityAPI,
  communityAPI,
  adminAPI,
  organizerAPI,
  notificationAPI,
  certificateAPI,
  badgeAPI,
  reportAPI,
  setupAPI,
} from '@/lib/api';

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const KEYS = {
  publicStats: () => ['public-stats'],
  opportunities: (filters?: object) => ['opportunities', filters],
  opportunity: (id: string) => ['opportunity', id],
  communities: (filters?: object) => ['communities', filters],
  community: (id: string) => ['community', id],
  adminStats: () => ['admin', 'stats'],
  adminUsers: (params?: object) => ['admin', 'users', params],
  adminReports: (params?: object) => ['admin', 'reports', params],
  adminBadges: () => ['admin', 'badges'],
  adminAlerts: () => ['admin', 'alerts'],
  organizerStats: () => ['organizer', 'stats'],
  organizerOpportunities: (params?: object) => ['organizer', 'opportunities', params],
  organizerApplications: (params?: object) => ['organizer', 'applications', params],
  notifications: (params?: object) => ['notifications', params],
  certificates: (userId: string) => ['certificates', userId],
  badges: () => ['badges'],
  myBadges: () => ['badges', 'mine'],
};

// ─── Public Stats (no auth needed) ─────────────────────────────────────────────
export const usePublicStats = () =>
  useQuery({
    queryKey: KEYS.publicStats(),
    queryFn: () => setupAPI.getPublicStats(),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // refresh every 2 min
  });

// ─── Opportunities ──────────────────────────────────────────────────────────────
export const useOpportunities = (filters?: Parameters<typeof opportunityAPI.getAll>[0]) =>
  useQuery({
    queryKey: KEYS.opportunities(filters),
    queryFn: () => opportunityAPI.getAll(filters),
  });

export const useOpportunity = (id: string) =>
  useQuery({
    queryKey: KEYS.opportunity(id),
    queryFn: () => opportunityAPI.getById(id),
    enabled: !!id,
  });

// ─── Communities ────────────────────────────────────────────────────────────────
export const useCommunities = (filters?: Parameters<typeof communityAPI.getAll>[0]) =>
  useQuery({
    queryKey: KEYS.communities(filters),
    queryFn: () => communityAPI.getAll(filters),
  });

export const useCommunity = (id: string) =>
  useQuery({
    queryKey: KEYS.community(id),
    queryFn: () => communityAPI.getById(id),
    enabled: !!id,
  });

// ─── Admin ──────────────────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: KEYS.adminStats(),
    queryFn: () => adminAPI.getStats(),
    refetchInterval: 30 * 1000, // refresh every 30s for live dashboard
  });

export const useAdminUsers = (params?: Parameters<typeof adminAPI.getUsers>[0]) =>
  useQuery({
    queryKey: KEYS.adminUsers(params),
    queryFn: () => adminAPI.getUsers(params),
  });

export const useAdminReports = (params?: Parameters<typeof adminAPI.getReports>[0]) =>
  useQuery({
    queryKey: KEYS.adminReports(params),
    queryFn: () => adminAPI.getReports(params),
  });

export const useAdminBadges = () =>
  useQuery({
    queryKey: KEYS.adminBadges(),
    queryFn: () => badgeAPI.adminGetAllBadges(),
  });

export const useEmergencyAlerts = () =>
  useQuery({
    queryKey: KEYS.adminAlerts(),
    queryFn: () => adminAPI.getEmergencyAlerts(),
    refetchInterval: 30 * 1000,
  });

// ─── Organizer ──────────────────────────────────────────────────────────────────
export const useOrganizerStats = () =>
  useQuery({
    queryKey: KEYS.organizerStats(),
    queryFn: () => organizerAPI.getStats(),
    refetchInterval: 30 * 1000,
  });

export const useOrganizerOpportunities = (params?: Parameters<typeof organizerAPI.getOpportunities>[0]) =>
  useQuery({
    queryKey: KEYS.organizerOpportunities(params),
    queryFn: () => organizerAPI.getOpportunities(params),
  });

export const useOrganizerApplications = (params?: Parameters<typeof organizerAPI.getApplications>[0]) =>
  useQuery({
    queryKey: KEYS.organizerApplications(params),
    queryFn: () => organizerAPI.getApplications(params),
  });

// ─── Notifications ──────────────────────────────────────────────────────────────
export const useNotifications = (params?: Parameters<typeof notificationAPI.getAll>[0]) =>
  useQuery({
    queryKey: KEYS.notifications(params),
    queryFn: () => notificationAPI.getAll(params),
    refetchInterval: 30 * 1000, // poll every 30s for new notifications
  });

// ─── Certificates ───────────────────────────────────────────────────────────────
export const useCertificates = (userId: string) =>
  useQuery({
    queryKey: KEYS.certificates(userId),
    queryFn: () => certificateAPI.getUserCertificates(userId),
    enabled: !!userId,
  });

// ─── Badges ─────────────────────────────────────────────────────────────────────
export const useBadges = () =>
  useQuery({
    queryKey: KEYS.badges(),
    queryFn: () => badgeAPI.getAllBadges(),
  });

export const useMyBadges = () =>
  useQuery({
    queryKey: KEYS.myBadges(),
    queryFn: () => badgeAPI.getMyBadges(),
  });

// ─── Mutations (with auto cache invalidation) ───────────────────────────────────
export const useSignUpOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opportunityAPI.signUp(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
};

export const useJoinCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityAPI.join(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useCreateReport = () =>
  useMutation({
    mutationFn: (data: Parameters<typeof reportAPI.create>[0]) => reportAPI.create(data),
  });
