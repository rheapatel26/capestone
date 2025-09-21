import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUPScreen from './src/screens/SignUPScreen';

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

// Main App Component with simple linear navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SignIn"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUP" component={SignUPScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        
        {/* Game Screens */}
        <Stack.Screen 
          name="DigitTracingGame" 
          component={DigitTracingGame}
          options={{
            title: 'Digit Tracing',
            headerShown: true,
            headerStyle: { backgroundColor: '#4D8080' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="ClockTimeGame" 
          component={ClockTimeGame}
          options={{
            title: 'Clock Time',
            headerShown: true,
            headerStyle: { backgroundColor: '#4D8080' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="BubbleCountingGame" 
          component={BubbleCountingGame}
          options={{
            title: 'Bubble Counting',
            headerShown: true,
            headerStyle: { backgroundColor: '#4D8080' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="AddSubBubblesGame" 
          component={AddSubBubblesGame}
          options={{
            title: 'Add/Sub Bubbles',
            headerShown: true,
            headerStyle: { backgroundColor: '#4D8080' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="MoneyConceptGame" 
          component={MoneyConceptGame}
          options={{
            title: 'Money Concept',
            headerShown: true,
            headerStyle: { backgroundColor: '#4D8080' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}