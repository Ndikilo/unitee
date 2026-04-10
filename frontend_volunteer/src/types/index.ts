// User types
export type UserType = 'volunteer' | 'organization' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'organizer';
  userType: UserType;
  // Volunteer fields
  profile?: {
    avatar?: string;
    phone?: string;
    city?: string;
    country?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    dateOfBirth?: string;
  };
  verification?: {
    emailVerified?: boolean;
    isVerified?: boolean;
  };
  stats?: {
    totalHours: number;
    totalEvents: number;
    peopleHelped: number;
    badges: any[];
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    emergencyAlerts: boolean;
    language: string;
  };
  // Organization fields
  organization?: {
    name?: string;
    description?: string;
    website?: string;
    type?: string;
    phone?: string;
    city?: string;
    region?: string;
    logo?: string;
    banner?: string;
  };
  // Admin fields
  adminRole?: 'super_admin' | 'moderator' | 'verifier' | 'support';
  permissions?: string[];
  // Legacy compat
  emailVerified?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse extends User {
  token: string;
}

// Community types
export interface Community {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  members: User[];
  createdAt: string;
}

// Opportunity types
export interface Opportunity {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  requiredVolunteers: number;
  community: Community;
  volunteers: User[];
  createdBy: User;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'archived';
  views: number;
  createdAt: string;
}

// Application types
export interface Application {
  _id: string;
  opportunityId: string;
  volunteerId: string;
  volunteer: User; // Reference to the volunteer who applied
  opportunity: Opportunity; // Reference to the opportunity
  skills: string[];
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

// Organizer types
export interface Organizer {
  _id: string;
  organizationName: string;
  verified: boolean;
  rating: number;
}

// Form types
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  organizationName?: string;
  organizationDescription?: string;
  organizationType?: string;
  organizationWebsite?: string;
  organizationPhone?: string;
  organizationCity?: string;
  organizationRegion?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface CommunityForm {
  name: string;
  description: string;
}

export interface OpportunityForm {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  requiredVolunteers: number;
  community: string;
}

export interface CreateOpportunityForm {
  title: string;
  category: string;
  goal: string;
  description: string;
  location: string;
  volunteersNeeded: number;
  hoursPerVolunteer: number;
  startDate: string;
}
