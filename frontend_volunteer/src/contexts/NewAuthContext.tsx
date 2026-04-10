import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { User, AuthResponse, LoginForm, RegisterForm, UserType } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  userType: UserType | null;
  login: (credentials: LoginForm) => Promise<AuthResponse>;
  register: (userData: RegisterForm) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Read token synchronously so initial state is correct — no flash
const getStoredToken = () => localStorage.getItem('token');
const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize directly from localStorage — avoids the null flash
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(true);

  // On mount: verify the stored token is still valid with the backend
  useEffect(() => {
    const verify = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const freshUser = await authAPI.getProfile();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        // Token invalid/expired — clear and show logged-out state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await authAPI.login(credentials);
    setUser(response);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  };

  const register = async (userData: RegisterForm): Promise<AuthResponse> => {
    const response = await authAPI.register(userData);
    // Don't set auth state on register — user needs to verify email first
    return response;
  };

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Call this to refresh user data from backend (e.g. after profile update)
  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authAPI.getProfile();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch {
      logout();
    }
  }, [logout]);

  // Listen for storage changes across tabs (e.g. logout in another tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
        setToken(null);
      }
      if (e.key === 'token' && e.newValue) {
        setToken(e.newValue);
        const u = getStoredUser();
        if (u) setUser(u);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      userType: user?.userType ?? null,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
