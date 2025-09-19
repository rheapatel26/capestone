// Game mapping utilities
export const GAME_MAPPINGS = {
  'BubbleCountingGame': 'Game1',
  'DigitTracingGame': 'Game2', 
  'ClockTimeGame': 'Game3',
  'MoneyConceptGame': 'Game4',
  'AddSubBubblesGame': 'Game5',
} as const;

export const REVERSE_GAME_MAPPINGS = {
  'Game1': 'BubbleCountingGame',
  'Game2': 'DigitTracingGame',
  'Game3': 'ClockTimeGame', 
  'Game4': 'MoneyConceptGame',
  'Game5': 'AddSubBubblesGame',
} as const;

export type GameName = keyof typeof GAME_MAPPINGS;
export type BackendGameName = keyof typeof REVERSE_GAME_MAPPINGS;

export const getBackendGameName = (gameName: GameName): BackendGameName => {
  return GAME_MAPPINGS[gameName];
};

export const getFrontendGameName = (backendGameName: BackendGameName): GameName => {
  return REVERSE_GAME_MAPPINGS[backendGameName];
};

export const getLevelName = (levelNumber: number): string => {
  return `level${levelNumber}`;
};
