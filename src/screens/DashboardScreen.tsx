import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Type Definitions (No changes needed here) ---
type RootStackParamList = {
  Dashboard: undefined;
  DigitTracingGame: undefined;
  ClockTimeGame: undefined;
  BubbleCountingGame: undefined;
  AddSubBubblesGame: undefined;
  MoneyConceptGame: undefined;
};

type DashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

type GameScreenNames =
  | 'DigitTracingGame'
  | 'ClockTimeGame'
  | 'BubbleCountingGame'
  | 'AddSubBubblesGame'
  | 'MoneyConceptGame';

const games: { id: string; name: string; icon: any; screen: GameScreenNames }[] = [
  { id: '1', name: 'Digit Tracing', icon: require('../../assets/icons/icon_digit.png'), screen: 'DigitTracingGame' },
  { id: '2', name: 'Clock Time', icon: require('../../assets/icons/icon_clock.png'), screen: 'ClockTimeGame' },
  { id: '3', name: 'Bubble Counting', icon: require('../../assets/icons/icon_bubbles.png'), screen: 'BubbleCountingGame' },
  { id: '4', name: 'Add/Sub Bubbles', icon: require('../../assets/icons/icon_math.png'), screen: 'AddSubBubblesGame' },
  { id: '5', name: 'Money Concept', icon: require('../../assets/icons/icon_money.png'), screen: 'MoneyConceptGame' },
];

// --- Main Dashboard Component ---
export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();

  const renderGameCard = ({ item }: { item: typeof games[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.8}
    >
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Let's Play!</Text>
      <Text style={styles.subtitle}>Choose a game to start</Text>
      <FlatList
        data={games}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={renderGameCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// --- NEW ENHANCED STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0EFFF', // Palette: Soft Powder Blue background
    paddingTop: 80, // More space for the title
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4D8080', // Palette: Muted Teal for text
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4D8080', // Palette: Muted Teal for text
    textAlign: 'center',
    marginBottom: 30, // Space between title and grid
  },
  grid: {
    paddingBottom: 20, // Padding at the bottom of the list
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFFFFF', // Clean white cards
    borderRadius: 20, // Softer, more modern corners
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    aspectRatio: 1, // Make the cards perfectly square
    // --- Adding depth with shadows ---
    shadowColor: '#4D8080', // Shadow color from the palette
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  icon: {
    width: '60%', // Icon size relative to the card
    height: '60%',
    marginBottom: 10,
  },
  cardText: {
    color: '#4D8080', // Palette: Muted Teal text on the card
    fontSize: 16,
    fontWeight: '600', // Bolder font
    textAlign: 'center',
  },
});