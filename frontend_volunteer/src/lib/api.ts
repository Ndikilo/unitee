// Resolve API base URL from environment variable (required in production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'API request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; confirmPassword?: string; role?: string; organizationName?: string; organizationDescription?: string; organizationType?: string; organizationWebsite?: string; organizationPhone?: string; organizationCity?: string; organizationRegion?: string }) => {
    const { confirmPassword, ...payload } = userData;
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  verifyEmail: async (token: string) => {
    return apiRequest(`/auth/verify-email/${token}`);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Community API
export const communityAPI = {
  getAll: async (params?: { category?: string; city?: string; search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/communities${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/communities/${id}`);
  },

  create: async (communityData: { name: string; description: string; category: string; location?: any; contactEmail?: string; website?: string }) => {
    return apiRequest('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    });
  },

  update: async (id: string, communityData: any) => {
    return apiRequest(`/communities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(communityData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/communities/${id}`, {
      method: 'DELETE',
    });
  },

  join: async (communityId: string) => {
    return apiRequest(`/communities/${communityId}/join`, {
      method: 'POST',
    });
  },

  leave: async (communityId: string) => {
    return apiRequest(`/communities/${communityId}/leave`, {
      method: 'POST',
    });
  },

  getUserCommunities: async () => {
    return apiRequest('/communities/my-communities');
  },
};

// Opportunity API
export const opportunityAPI = {
  getAll: async (filters?: { 
    category?: string; 
    city?: string; 
    community?: string; 
    date?: string; 
    search?: string; 
    status?: string; 
    isEmergency?: boolean;
    page?: number; 
    limit?: number;
    sortBy?: string;
  }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest(`/opportunities${params ? `?${params}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/opportunities/${id}`);
  },

  create: async (opportunityData: {
    title: string;
    description: string;
    category: string;
    location: any;
    dateTime: any;
    requirements?: any;
    capacity: any;
    community: string;
    contactInfo?: any;
    impact?: any;
    tags?: string[];
    isEmergency?: boolean;
  }) => {
    return apiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  },

  update: async (id: string, opportunityData: any) => {
    return apiRequest(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunityData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  },

  signUp: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}/signup`, {
      method: 'POST',
    });
  },

  cancelSignup: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}/signup`, {
      method: 'DELETE',
    });
  },

  getUserOpportunities: async (type?: 'registered' | 'created') => {
    const params = type ? `?type=${type}` : '';
    return apiRequest(`/opportunities/my-opportunities${params}`);
  },

  addReview: async (opportunityId: string, rating: number, comment: string) => {
    return apiRequest(`/opportunities/${opportunityId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  getTestimonials: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest(`/opportunities/testimonials${params}`);
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getAnalytics: async () => {
    return apiRequest('/admin/analytics');
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
  },

  updateUserStatus: async (userId: string, status: { isActive?: boolean; isVerified?: boolean }) => {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  },

  getReports: async (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/reports${queryParams ? `?${queryParams}` : ''}`);
  },

  updateReport: async (reportId: string, data: { status: string; resolution?: string }) => {
    return apiRequest(`/admin/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getVerificationQueue: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/verifications${queryParams ? `?${queryParams}` : ''}`);
  },

  updateVerificationStatus: async (userId: string, status: string) => {
    return apiRequest(`/admin/verifications/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  createEmergencyAlert: async (alertData: { title: string; message: string; severity: string; targetCity?: string }) => {
    return apiRequest('/admin/emergency-alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  getEmergencyAlerts: async () => {
    return apiRequest('/admin/emergency-alerts');
  },

  deactivateEmergencyAlert: async (alertId: string) => {
    return apiRequest(`/admin/emergency-alerts/${alertId}/deactivate`, {
      method: 'PUT',
    });
  },
};

// Organizer API
export const organizerAPI = {
  getStats: async () => {
    return apiRequest('/organizer/stats');
  },

  getOpportunities: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/organizer/opportunities${queryParams ? `?${queryParams}` : ''}`);
  },

  getApplications: async (params?: { status?: string; opportunityId?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/organizer/applications${queryParams ? `?${queryParams}` : ''}`);
  },

  updateApplicationStatus: async (applicationId: string, status: 'accepted' | 'rejected') => {
    return apiRequest(`/organizer/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateOpportunityStatus: async (opportunityId: string, status: string) => {
    return apiRequest(`/organizer/opportunities/${opportunityId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  generateOpportunityContent: async (data: { title: string; goal: string; location: string; category: string }) => {
    return apiRequest('/organizer/ai-assist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return apiRequest('/organizer/profile');
  },
};

// Report API
export const reportAPI = {
  create: async (reportData: { type: string; targetId: string; targetModel: string; reason: string; description?: string }) => {
    return apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  getUserReports: async () => {
    return apiRequest('/reports/my-reports');
  },
};

// Notification API
export const notificationAPI = {
  getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/notifications${queryParams ? `?${queryParams}` : ''}`);
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  delete: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Certificate API
export const certificateAPI = {
  getUserCertificates: async (userId: string) => {
    return apiRequest(`/certificates/user/${userId}`);
  },

  getCertificateById: async (certificateId: string) => {
    return apiRequest(`/certificates/${certificateId}`);
  },

  verifyCertificate: async (certificateId: string) => {
    return apiRequest(`/certificates/verify/${certificateId}`);
  },

  downloadCertificate: async (certificateId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// Badge API
export const badgeAPI = {
  getAllBadges: async () => {
    return apiRequest('/badges');
  },

  getMyBadges: async () => {
    return apiRequest('/badges/my-badges');
  },

  checkBadges: async () => {
    return apiRequest('/badges/check', {
      method: 'POST',
    });
  },

  // Admin badge management
  adminGetAllBadges: async () => {
    return apiRequest('/admin/badges');
  },

  adminCreateBadge: async (badgeData: {
    name: string;
    description: string;
    icon: string;
    category: string;
    criteria: { type: string; threshold: number };
    tier?: string;
    points?: number;
  }) => {
    return apiRequest('/admin/badges', {
      method: 'POST',
      body: JSON.stringify(badgeData),
    });
  },

  adminUpdateBadge: async (badgeId: string, badgeData: any) => {
    return apiRequest(`/admin/badges/${badgeId}`, {
      method: 'PUT',
      body: JSON.stringify(badgeData),
    });
  },

  adminDeleteBadge: async (badgeId: string) => {
    return apiRequest(`/admin/badges/${badgeId}`, {
      method: 'DELETE',
    });
  },

  adminToggleBadge: async (badgeId: string) => {
    return apiRequest(`/admin/badges/${badgeId}/toggle`, {
      method: 'PATCH',
    });
  },

  adminGetBadgeStats: async (badgeId: string) => {
    return apiRequest(`/admin/badges/${badgeId}/stats`);
  },

  adminDuplicateBadge: async (badgeId: string) => {
    return apiRequest(`/admin/badges/${badgeId}/duplicate`, {
      method: 'POST',
    });
  },
};

// Setup API
export const setupAPI = {
  createAdmin: async (adminData: { name: string; email: string; password: string; setupKey: string }) => {
    return apiRequest('/setup/admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  checkAdminExists: async () => {
    return apiRequest('/setup/admin-exists');
  },

  // Public — no auth required, safe to call on home page
  getPublicStats: async () => {
    return apiRequest('/setup/public-stats');
  },
};

export default apiRequest;
