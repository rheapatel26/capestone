// Configuration for the application
export const config = {
  // Backend API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Game Configuration
  GAMES: {
    'BubbleCountingGame': {
      name: 'Bubble Counting',
      maxLevel: 5,
      backendId: 'Game1'
    },
    'DigitTracingGame': {
      name: 'Digit Tracing',
      maxLevel: 5,
      backendId: 'Game2'
    },
    'ClockTimeGame': {
      name: 'Clock Time',
      maxLevel: 5,
      backendId: 'Game3'
    },
    'MoneyConceptGame': {
      name: 'Money Concept',
      maxLevel: 5,
      backendId: 'Game4'
    },
    'AddSubBubblesGame': {
      name: 'Add/Sub Bubbles',
      maxLevel: 5,
      backendId: 'Game5'
    }
  },
  
  // API Timeout (in milliseconds)
  API_TIMEOUT: 10000,
  
  // Debug mode
  DEBUG: __DEV__,
} as const;

export default config;
