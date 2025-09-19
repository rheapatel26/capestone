import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Context
import { UserProvider, useUser } from './src/context/UserContext';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

// Games
import DigitTracingGame from './src/games/DigitTracingGame';
import ClockTimeGame from './src/games/ClockTimeGame';
import BubbleCountingGame from './src/games/BubbleCountingGame';
import AddSubBubblesGame from './src/games/AddSubBubblesGame';
import MoneyConceptGame from './src/games/MoneyConceptGame';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab with Dashboard, Profile, Settings
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#222', height: 60 },
        tabBarActiveTintColor: '#FFD166',
        tabBarInactiveTintColor: '#aaa',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <Image source={require('./assets/icons/icon_home.png')} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <Image source={require('./assets/icons/icon_user.png')} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <Image source={require('./assets/icons/icon_settings.png')} style={{ width: size, height: size }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Component that handles authentication flow
function AppContent() {
  const { user } = useUser();
  
  // If no user is logged in, show login screen
  if (!user) {
    return <LoginScreen onLoginSuccess={() => {/* Navigation will handle this */}} />;
  }
  
  // If user is logged in, show main app
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="DigitTracingGame" component={DigitTracingGame} />
        <Stack.Screen name="ClockTimeGame" component={ClockTimeGame} />
        <Stack.Screen name="BubbleCountingGame" component={BubbleCountingGame} />
        <Stack.Screen name="AddSubBubblesGame" component={AddSubBubblesGame} />
        <Stack.Screen name="MoneyConceptGame" component={MoneyConceptGame} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
// import React from 'react';
// import DashboardScreen from './src/screens/DashboardScreen';

// export default function App() {
//   return <DashboardScreen />;
// }
