import { gameAPI } from './api';

// Universal Game Flow Manager
// Handles attempts, hints, grading, advancement

export type IndependenceStatus = 'independent' | 'partial' | 'dependent';

interface GameConfig {
  username: string;
  gameName: string;
  currentLevel: number;
}

export class GameFlowManager {
  attempts: number;
  incorrectAttempts: number;
  hintLevel: number; // 0-3
  status: IndependenceStatus | null;
  private config?: GameConfig;

  constructor(config?: GameConfig) {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
    this.config = config;
  }

  async recordAttempt(correct: boolean) {
    this.attempts++;
    if (!correct) {
      this.incorrectAttempts++;
      this.updateHints();
    }
    this.evaluateStatus(correct);
    await this.syncWithBackend();
  }

  updateHints() {
    // Unlock hints progressively after thresholds
    if (this.incorrectAttempts === 3 && this.hintLevel < 1) {
      this.hintLevel = 1;
    } else if (this.incorrectAttempts === 8 && this.hintLevel < 2) {
      this.hintLevel = 2;
    } else if (this.incorrectAttempts === 11 && this.hintLevel < 3) {
      this.hintLevel = 3; // Unlock solution animation after this
    }
  }

  evaluateStatus(correct: boolean) {
    if (correct) {
      if (this.hintLevel === 0) this.status = 'independent';
      else if (this.hintLevel > 0 && this.hintLevel < 3) this.status = 'partial';
      else if (this.hintLevel === 3) this.status = 'dependent';
    }
  }

  async resetLevel() {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
    await this.syncWithBackend();
  }

  private async syncWithBackend() {
    if (!this.config) return;

    try {
      await gameAPI.updateProgress(
        this.config.username,
        this.config.gameName,
        `level${this.config.currentLevel}`,
        {
          attempts: this.attempts,
          incorrectAttempts: this.incorrectAttempts,
          hintLevel: this.hintLevel,
          status: this.status,
          completed: this.status !== null
        }
      );
    } catch (error) {
      console.error('Error syncing with backend:', error);
    }
  }
}
