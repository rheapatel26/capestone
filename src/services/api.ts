import axios from 'axios';
import config from '../config/config';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API requests/responses
export interface LevelData {
  hints_used: number;
  solution_used: boolean;
  incorrect: number;
  correct_attempts: number;
}

export interface User {
  username: string;
  levels_completed: Record<string, number>;
  Game1: Game;
  Game2: Game;
  Game3: Game;
  Game4: Game;
  Game5: Game;
}

export interface Game {
  level1: LevelData;
  level2: LevelData;
  level3: LevelData;
  level4: LevelData;
  level5: LevelData;
}

// API Service class
export class ApiService {
  
  // User Management
  static async createUser(username: string): Promise<User> {
    try {
      const response = await api.post('/users/user/', {
        username,
        levels_completed: {},
        Game1: {},
        Game2: {},
        Game3: {},
        Game4: {},
        Game5: {},
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
}

export default api;
