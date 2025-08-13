import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


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

// WITH BUG
// const games = [
//   { id: '1', name: 'Digit Tracing', icon: require('../../assets/icons/icon_digit.png'), screen: 'DigitTracingGame' },
//   { id: '2', name: 'Clock Time', icon: require('../../assets/icons/icon_clock.png'), screen: 'ClockTimeGame' },
//   { id: '3', name: 'Bubble Counting', icon: require('../../assets/icons/icon_bubbles.png'), screen: 'BubbleCountingGame' },
//   { id: '4', name: 'Add/Sub Bubbles', icon: require('../../assets/icons/icon_math.png'), screen: 'AddSubBubblesGame' },
//   { id: '5', name: 'Money Concept', icon: require('../../assets/icons/icon_money.png'), screen: 'MoneyConceptGame' },
// ];

export default function DashboardScreen() {
  // const navigation = useNavigation();
  const navigation = useNavigation<DashboardNavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Game Dashboard 🎮</Text>
      <FlatList
        data={games}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1020', padding: 20 },
  title: { fontSize: 18, color: '#FFD166', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  grid: { justifyContent: 'center' },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#203040',
    borderRadius: 10,
    alignItems: 'center',
    padding: 15,
  },
  icon: { width: 60, height: 60, marginBottom: 10 },
  cardText: { color: '#fff', fontSize: 14, textAlign: 'center' },
});
