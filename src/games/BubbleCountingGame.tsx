import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BubbleCountingGame() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bubble Counting Game - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1020' },
  text: { color: '#FFD166', fontSize: 18, textAlign: 'center' },
});
