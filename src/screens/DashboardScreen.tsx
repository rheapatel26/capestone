import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  StatusBar, 
  ImageBackground 
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Type Definitions ---
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

    const [fontsLoaded] = useFonts({
    PixelFont: require('../../assets/fonts/PressStart2P-Regular.ttf'),
  });

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
    <ImageBackground
      source={require('../../assets/menu_bg.png')} // background image
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={games}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={renderGameCard}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'PixelFont',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f0f0',
    textAlign: 'center',
    fontFamily: 'PixelFont',
    marginBottom: 30,
  },
  grid: {
    paddingBottom: 20,
    marginTop: 75,
  },
  card: {
    flex: 2,
    margin: 10,
    flexDirection: 'row', // 👈 makes icon + text side by side
    alignItems: 'center', // vertically center
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.51)',
    borderRadius: 20,
    padding: 10,
    aspectRatio: 1.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    width: "75%",  // 👈 fixed width
    height: "75%", // 👈 fixed height
    resizeMode: 'contain',
    marginRight: -24,
    marginLeft: -35,
  },
  cardText: {
    flex: 1, // 👈 text takes remaining space
    color: '#4D8080',
    fontFamily: 'PixelFont',
    fontSize: 14,
    lineHeight: 25,
    fontWeight: '400',
    textAlign: 'left',
  },
});

