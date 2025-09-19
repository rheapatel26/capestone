# Backend Integration with Educational Games

This document describes how the frontend games are integrated with the backend API using axios.

## Architecture Overview

The integration consists of several key components:

### 1. API Service Layer (`src/services/api.ts`)
- Handles all HTTP requests to the backend
- Provides typed interfaces for API responses
- Centralized error handling and configuration

### 2. Game Flow Manager (`src/utils/GameFlowManager.ts`)
- Universal game state management
- Tracks attempts, hints, and progress
- Automatically syncs with backend
- Handles level completion tracking

### 3. User Context (`src/context/UserContext.tsx`)
- Manages user authentication state
- Provides user data throughout the app
- Handles login/logout functionality

### 4. Game Mapping (`src/utils/gameMapping.ts`)
- Maps frontend game names to backend game IDs
- Translates level numbers to backend format

## Backend API Endpoints

### User Management
- `POST /users/user/` - Create new user
- `GET /users/user/{username}` - Get user data
- `POST /users/user/{username}/game/{game}/level/{level}` - Update level data

### Game Progress
- `POST /games/game/{username}/{game}/complete/{level}` - Mark level complete

## Game Integration Example

Each game can be integrated with the backend by:

1. **Adding props for level and completion callback:**
```typescript
interface GameProps {
  currentLevel?: number;
  onLevelComplete?: () => void;
}
```

2. **Using the User Context:**
```typescript
import { useUser } from '../context/UserContext';
const { user } = useUser();
```

3. **Setting up GameFlowManager:**
```typescript
import { GameFlowManager, GameConfig } from '../utils/GameFlowManager';

const managerRef = useRef(new GameFlowManager()).current;

useEffect(() => {
  if (user) {
    const config: GameConfig = {
      username: user.username,
      gameName: getBackendGameName('YourGameName'),
      levelName: getLevelName(currentLevel),
    };
    managerRef.setConfig(config);
  }
}, [user, currentLevel]);
```

4. **Recording attempts and syncing:**
```typescript
// On correct answer
managerRef.recordAttempt(true);
managerRef.markLevelComplete().then(() => {
  onLevelComplete?.();
}).catch(console.error);

// On incorrect answer
managerRef.recordAttempt(false);
managerRef.syncWithBackend().catch(console.error);

// On hint usage
managerRef.syncWithBackend().catch(console.error);

// On solution usage
managerRef.useSolution();
managerRef.syncWithBackend().catch(console.error);
```

## Configuration

### Environment Variables
Set `EXPO_PUBLIC_API_URL` to your backend URL (defaults to `http://localhost:8000`)

### Backend Mapping
Games are mapped to backend IDs:
- BubbleCountingGame → Game1
- DigitTracingGame → Game2
- ClockTimeGame → Game3
- MoneyConceptGame → Game4
- AddSubBubblesGame → Game5

## Data Tracked

For each level, the system tracks:
- `hints_used`: Number of hints accessed
- `solution_used`: Whether solution was viewed
- `incorrect`: Number of incorrect attempts
- `correct_attempts`: Number of successful completions

## User Authentication

Users are authenticated by username. The system will:
1. Try to fetch existing user data
2. Create a new user if none exists
3. Maintain user session throughout the app

## Getting Started

1. **Start the backend server** (ensure it's running on the configured URL)

2. **Install dependencies:**
```bash
npm install axios
```

3. **Wrap your app with UserProvider:**
```typescript
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <UserProvider>
      {/* Your app content */}
    </UserProvider>
  );
}
```

4. **Update games to use the integration** (see examples in BubbleCountingGame.tsx and DigitTracingGame.tsx)

## Error Handling

- API errors are logged to console
- Progress sync continues to work offline
- User experience remains smooth even if backend is unavailable
- Retry logic can be added for production use

## Development Notes

- All API calls are asynchronous and non-blocking
- Progress is synced in real-time during gameplay
- User data is refreshed when needed
- Backend integration is optional - games work standalone

## Files Modified

### Core Integration Files:
- `src/services/api.ts` - API service layer
- `src/utils/GameFlowManager.ts` - Enhanced with backend sync
- `src/context/UserContext.tsx` - User state management
- `src/utils/gameMapping.ts` - Game name mapping
- `src/config/config.ts` - Configuration management

### UI Updates:
- `App.tsx` - Added UserProvider wrapper
- `src/screens/ProfileScreen.tsx` - Real user data display
- `src/screens/LoginScreen.tsx` - User authentication

### Game Examples:
- `src/games/BubbleCountingGame.tsx` - Full backend integration
- `src/games/DigitTracingGame.tsx` - Basic backend integration

## Next Steps

To integrate remaining games:
1. Add props for `currentLevel` and `onLevelComplete`
2. Import and use `useUser` hook
3. Set up GameFlowManager configuration
4. Add sync calls on game events (attempts, hints, completion)
5. Test with backend running

The integration is designed to be non-intrusive and can be gradually rolled out to all games.
