import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'volunteer' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  skills?: string[];
  interests?: string[];
  language?: string;
  is_verified?: boolean;
  verification_status?: string;
  organization_name?: string;
  organization_description?: string;
  total_hours?: number;
  total_events?: number;
  people_helped?: number;
  is_banned?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<string, User> = {
  'volunteer@unitee.cm': {
    id: 'demo-volunteer-1',
    email: 'volunteer@unitee.cm',
    full_name: 'Marie Ngono',
    role: 'volunteer',
    city: 'Douala',
    country: 'Cameroon',
    skills: ['Teaching', 'Communication', 'First Aid'],
    interests: ['Education', 'Healthcare'],
    is_verified: true,
    total_hours: 45,
    total_events: 8,
    people_helped: 120,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  'organizer@unitee.cm': {
    id: 'demo-organizer-1',
    email: 'organizer@unitee.cm',
    full_name: 'Jean-Pierre Kamga',
    role: 'organizer',
    city: 'Yaoundé',
    country: 'Cameroon',
    is_verified: true,
    verification_status: 'verified',
    organization_name: 'Green Cameroon Foundation',
    organization_description: 'Environmental conservation and community development',
    total_hours: 0,
    total_events: 15,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  'admin@unitee.cm': {
    id: 'demo-admin-1',
    email: 'admin@unitee.cm',
    full_name: 'Admin UNITEE',
    role: 'admin',
    city: 'Yaoundé',
    country: 'Cameroon',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('unitee_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Check demo users first
      const demoUser = demoUsers[email.toLowerCase()];
      if (demoUser && password === 'demo123') {
        setUser(demoUser);
        localStorage.setItem('unitee_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return { success: true };
      }

      // Try Supabase auth
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }

      setUser(data as User);
      localStorage.setItem('unitee_user', JSON.stringify(data));
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        full_name: name,
        role,
        country: 'Cameroon',
        is_verified: false,
        verification_status: 'pending',
        total_hours: 0,
        total_events: 0,
        people_helped: 0,
        skills: [],
        interests: []
      };

      // Try to insert into Supabase
      const { error } = await supabase.from('users').insert([newUser]);

      if (error) {
        console.log('Supabase insert error, using local storage:', error);
      }

      setUser(newUser);
      localStorage.setItem('unitee_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during sign up' };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('unitee_user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('unitee_user', JSON.stringify(updatedUser));

      // Try to update in Supabase
      await supabase.from('users').update(updates).eq('id', user.id);

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
