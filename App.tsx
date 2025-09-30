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
import SignInScreen from './src/screens/SignInScreen';
import SignUPScreen from './src/screens/SignUPScreen';

import { AudioProvider } from './src/context/MusicContext';

// Games
import DigitTracingGame from './src/games/DigitTracingGame';
import ClockTimeGame from './src/games/ClockTimeGame';
import BubbleCountingGame from './src/games/BubbleCountingGame';
import AddSubBubblesGame from './src/games/AddSubBubblesGame';
import MoneyConceptGame from './src/games/MoneyConceptGame';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (used after login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // ✅ hides only the TOP nav bar, keeps bottom tabs
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
            <Image 
              source={require('./assets/icons/icon_home.png')} 
              style={{ width: size, height: size }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <Image 
              source={require('./assets/icons/icon_user.png')} 
              style={{ width: size, height: size }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <Image 
              source={require('./assets/icons/icon_settings.png')} 
              style={{ width: size, height: size }} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Component that handles authentication flow
function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  
  // Show loading or determine which screen to show
  if (isLoading) {
    return null; // or a loading screen
  }
  
  return (

    <AudioProvider>
      <NavigationContainer>
        <Stack.Navigator 
          
          initialRouteName={isAuthenticated ? "MainTabs" : "SignIn"}
          screenOptions={{ headerShown: false }} // ✅ hides TOP nav bar everywhere
          >
          {/* Auth Screens */}
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUP" component={SignUPScreen} />
          
          {/* Main App Screens */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          
          {/* Game Screens */}
          <Stack.Screen name="DigitTracingGame" component={DigitTracingGame} />
          <Stack.Screen name="ClockTimeGame" component={ClockTimeGame} />
          <Stack.Screen name="BubbleCountingGame" component={BubbleCountingGame} />
          <Stack.Screen name="AddSubBubblesGame" component={AddSubBubblesGame} />
          <Stack.Screen name="MoneyConceptGame" component={MoneyConceptGame} />
        </Stack.Navigator>
      </NavigationContainer>
    </AudioProvider>

  );
}

// Main App Component
export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
