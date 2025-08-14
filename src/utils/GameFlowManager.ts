// Universal Game Flow Manager
// Handles attempts, hints, grading, advancement

export type IndependenceStatus = 'independent' | 'partial' | 'dependent';

export class GameFlowManager {
  attempts: number;
  incorrectAttempts: number;
  hintLevel: number; // 0-3
  status: IndependenceStatus | null;

  constructor() {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
  }

  recordAttempt(correct: boolean) {
    this.attempts++;
    if (!correct) {
      this.incorrectAttempts++;
      this.updateHints();
    }
    this.evaluateStatus(correct);
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

  resetLevel() {
    this.attempts = 0;
    this.incorrectAttempts = 0;
    this.hintLevel = 0;
    this.status = null;
  }
}
