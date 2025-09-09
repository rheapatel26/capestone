import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// A reusable component for each setting row
const SettingRow = ({ icon, label, value, onValueChange }: { icon: any; label: string; value: boolean; onValueChange: (newValue: boolean) => void; }) => (
  <View style={styles.settingRow}>
    <MaterialCommunityIcons name={icon} size={24} color="#4D8080" />
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      trackColor={{ false: '#b0bec5', true: '#80cbc4' }}
      thumbColor={value ? '#4D8080' : '#eceff1'}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);


export default function SettingsScreen() {
  // --- State Management for Settings ---
  // In a real app, you would lift this state into a global context (like StatsContext)
  // so that other parts of the app can respect these settings.
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(false);

  // --- Functions ---
  const handleResetPress = () => {
    Alert.alert(
      "Reset All Progress?",
      "Are you sure you want to erase all game data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: () => {
            // In a real app, you would call a function from your StatsContext here
            // e.g., stats.resetAllData();
            console.log("User progress has been reset.");
            Alert.alert("Progress Reset", "All your game data has been cleared.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Settings</Text>

      {/* --- Sound & Music Card --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sound & Music</Text>
        <SettingRow
          icon="music-note"
          label="Game Music"
          value={isMusicEnabled}
          onValueChange={setIsMusicEnabled}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="volume-high"
          label="Sound Effects"
          value={isSfxEnabled}
          onValueChange={setIsSfxEnabled}
        />
      </View>

      {/* --- Accessibility Card --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <SettingRow
          icon="text-to-speech"
          label="Read Instructions Aloud"
          value={isTextToSpeechEnabled}
          onValueChange={setIsTextToSpeechEnabled}
        />
      </View>

      {/* --- Data Management Card --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPress} activeOpacity={0.7}>
          <MaterialCommunityIcons name="delete-restore" size={20} color="#c62828" />
          <Text style={styles.resetButtonText}>Reset All Progress</Text>
        </TouchableOpacity>
      </View>
      
      {/* --- About Section --- */}
      <View style={styles.aboutContainer}>
          <Text style={styles.aboutText}>Learning App - Version 1.0.0</Text>
          <Text style={styles.aboutLink}>Privacy Policy</Text>
      </View>
    </ScrollView>
  );
}

// --- STYLESHEET (Using the "Calm Sea and Sky" theme) ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E0EFFF', // Soft Powder Blue background
  },
  scrollContent: {
    padding: 16,
    paddingTop: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4D8080', // Muted Teal for text
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4D8080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4D8080',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#4D8080',
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0f2f1',
    marginVertical: 5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcdd2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  aboutContainer: {
      alignItems: 'center',
      marginTop: 20,
      paddingBottom: 40,
  },
  aboutText: {
      fontSize: 14,
      color: '#5f8a8a'
  },
  aboutLink: {
      fontSize: 14,
      color: '#4D8080',
      fontWeight: '600',
      marginTop: 8,
      textDecorationLine: 'underline',
  }
});
