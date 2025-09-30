import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, User, SignUpData, SignInData } from '../services/api';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>; // Legacy login
  signIn: (userData: SignInData) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading to check auth
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await ApiService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // Could fetch user data here if we had a /me endpoint
        // For now, user will be set when they actually interact
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New sign up method
  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.signUp(userData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to sign up');
      console.error('Sign up error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // New sign in method
  const signIn = async (userData: SignInData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.signIn(userData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to sign in');
      console.error('Sign in error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy login method (for backward compatibility)
  const login = async (username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get existing user first
      let userData: User;
      try {
        userData = await ApiService.getUser(username);
      } catch (err) {
        // If user doesn't exist, create new user
        console.log('User not found, creating new user...');
        userData = await ApiService.createUser(username);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userData = await ApiService.getUser(user.username);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user data');
      console.error('Refresh user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    error,
    login,
    signIn,
    signUp,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
