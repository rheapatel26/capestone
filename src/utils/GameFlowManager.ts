// Universal Game Flow Manager
// Handles attempts, hints, grading, advancement

import { ApiService, LevelData } from '../services/api';

export type IndependenceStatus = 'independent' | 'partial' | 'dependent';

export interface GameConfig {
  username: string;
  gameName: string; // Game1, Game2, etc.
  levelName: string; // level1, level2, etc.
}

export class GameFlowManager {
  attempts: number;
  incorrectAttempts: number;
  hintLevel: number; // 0-3
  status: IndependenceStatus | null;
  hintsUsed: number;
  solutionUsed: boolean;
  correctAttempts: number;
  config: GameConfig | null;

  constructor(config?: GameConfig) {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
    this.hintsUsed = 0;
    this.solutionUsed = false;
    this.correctAttempts = 0;
    this.config = config || null;
  }

  recordAttempt(correct: boolean) {
    this.attempts++;
    if (!correct) {
      this.incorrectAttempts++;
      this.updateHints();
    } else {
      this.correctAttempts++;
    }
    this.evaluateStatus(correct);
  }

  updateHints() {
    // Unlock hints progressively after thresholds
    if (this.incorrectAttempts === 3 && this.hintLevel < 1) {
      this.hintLevel = 1;
      this.hintsUsed++;
    } else if (this.incorrectAttempts === 8 && this.hintLevel < 2) {
      this.hintLevel = 2;
      this.hintsUsed++;
    } else if (this.incorrectAttempts === 11 && this.hintLevel < 3) {
      this.hintLevel = 3; // Unlock solution animation after this
      this.hintsUsed++;
    }
  }

  evaluateStatus(correct: boolean) {
    if (correct) {
      if (this.hintLevel === 0) this.status = 'independent';
      else if (this.hintLevel > 0 && this.hintLevel < 3) this.status = 'partial';
      else if (this.hintLevel === 3) this.status = 'dependent';
    }
  }

  resetLevel() {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
    this.hintsUsed = 0;
    this.solutionUsed = false;
    this.correctAttempts = 0;
  }

  useSolution() {
    this.solutionUsed = true;
  }

  setConfig(config: GameConfig) {
    this.config = config;
  }

  // Sync progress with backend
  async syncWithBackend(): Promise<void> {
    if (!this.config) {
      console.warn('GameFlowManager: No config set, cannot sync with backend');
      return;
    }

    const levelData: LevelData = {
      hints_used: this.hintsUsed,
      solution_used: this.solutionUsed,
      incorrect: this.incorrectAttempts,
      correct_attempts: this.correctAttempts,
    };

    try {
      await ApiService.updateLevelData(
        this.config.username,
        this.config.gameName,
        this.config.levelName,
        levelData
      );
      console.log('Progress synced with backend successfully');
    } catch (error) {
      console.error('Failed to sync progress with backend:', error);
    }
  }

  // Mark level as complete in backend
  async markLevelComplete(): Promise<void> {
    if (!this.config) {
      console.warn('GameFlowManager: No config set, cannot mark level complete');
      return;
    }

    try {
      // First sync the current progress
      await this.syncWithBackend();
      
      // Then mark as complete
      await ApiService.markLevelComplete(
        this.config.username,
        this.config.gameName,
        this.config.levelName
      );
      console.log('Level marked as complete in backend');
    } catch (error) {
      console.error('Failed to mark level complete in backend:', error);
    }
  }
}
