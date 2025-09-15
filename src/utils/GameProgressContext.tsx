import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userAPI, gameAPI } from './api';

interface GameProgress {
  [key: string]: number; // game name -> level number
}

interface GameProgressContextType {
  currentLevels: GameProgress;
  updateGameProgress: (gameName: string, level: number) => Promise<void>;
}

const GameProgressContext = createContext<GameProgressContextType>({
  currentLevels: {},
  updateGameProgress: async () => {},
});

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  const [currentLevels, setCurrentLevels] = useState<GameProgress>({});
  const { username, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && username) {
      loadGameProgress();
    } else {
      setCurrentLevels({});
    }
  }, [username, isAuthenticated]);

  const loadGameProgress = async () => {
    try {
      const response = await userAPI.get(username!);
      setCurrentLevels(response.data.levels_completed || {});
    } catch (error) {
      console.error('Error loading game progress:', error);
    }
  };

  const updateGameProgress = async (gameName: string, level: number) => {
    if (!username) return;

    try {
      await gameAPI.completeLevel(username, gameName, `level${level}`);
      
      setCurrentLevels(prev => ({
        ...prev,
        [gameName]: Math.max(prev[gameName] || 0, level),
      }));
    } catch (error) {
      console.error('Error updating game progress:', error);
    }
  };

  return (
    <GameProgressContext.Provider value={{
      currentLevels,
      updateGameProgress,
    }}>
      {children}
    </GameProgressContext.Provider>
  );
}

export const useGameProgress = () => useContext(GameProgressContext);
