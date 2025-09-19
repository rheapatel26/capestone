import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, User } from '../services/api';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
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
    logout,
    refreshUser,
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
