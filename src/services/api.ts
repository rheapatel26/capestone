import axios from 'axios';
import config from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types for API requests/responses
export interface LevelData {
  hints_used: number;
  solution_used: boolean;
  incorrect: number;
  correct_attempts: number;
  start_time?: string;
  completion_time?: string;
  total_time_spent?: number;
  is_completed?: boolean;
  best_score?: number;
  attempts_count?: number;
  independence_level?: string;
  difficulty_rating?: number;
}

export interface User {
  username: string;
  email?: string;
  created_at: string;
  last_active: string;
  levels_completed: Record<string, number>;
  total_play_time: number;
  Game1: any; // Will be BubbleCountingGameData
  Game2: any; // Will be DigitTracingGameData
  Game3: any; // Will be ClockTimeGameData
  Game4: any; // Will be MoneyConceptGameData
  Game5: any; // Will be AddSubBubblesGameData
}

export interface SignUpData {
  username: string;
  email?: string;
  password: string;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// API Service class
export class ApiService {
  
  // Authentication
  static async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const response = await api.post('/users/signup', userData);
      // Store token
      await AsyncStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signIn(userData: SignInData): Promise<AuthResponse> {
    try {
      const response = await api.post('/users/signin', userData);
      // Store token
      await AsyncStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
  }

  // Legacy User Management (for backward compatibility)
  static async createUser(username: string): Promise<User> {
    try {
      const response = await api.post('/users/user/', {
        username,
        password_hash: 'legacy', // Legacy users without proper auth
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(username: string): Promise<User> {
    try {
      const response = await api.get(`/users/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Level Progress Management
  static async updateLevelData(
    username: string, 
    game: string, 
    level: string, 
    levelData: LevelData
  ): Promise<User> {
    try {
      const response = await api.post(
        `/users/user/${username}/game/${game}/level/${level}`,
        levelData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating level data:', error);
      throw error;
    }
  }

  // Game Completion
  static async markLevelComplete(
    username: string, 
    game: string, 
    level: string
  ): Promise<{message: string; levels_completed: Record<string, number>}> {
    try {
      const response = await api.post(
        `/games/game/${username}/${game}/complete/${level}`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking level complete:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  }

  // Get stored token
  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }
}

export default api;
