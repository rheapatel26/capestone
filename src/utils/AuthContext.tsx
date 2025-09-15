import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from './api';

interface AuthContextType {
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Load saved username from storage if exists
    // TODO: Add proper token-based auth later
    const loadSavedUser = async () => {
      try {
        // Check if user exists in backend
        await userAPI.get(username!);
      } catch (error) {
        console.error('Error loading user:', error);
        setUsername(null);
      }
    };

    if (username) {
      loadSavedUser();
    }
  }, [username]);

  const login = async (newUsername: string) => {
    try {
      // Create user if doesn't exist
      await userAPI.create(newUsername);
      setUsername(newUsername);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{
      username,
      isAuthenticated: !!username,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
