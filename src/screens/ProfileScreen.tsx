import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Type Definitions for our data (This fixes the TypeScript error) ---
interface GameStat {
  gameId: string;
  gameName: string;
  attempts: number;
  currentLevel: number;
  maxLevel: number;
  independentSolutions: number;
  hintSolutions: number;
  needsPractice: number;
}

interface UserStats {
  userName: string;
  lastActive: string;
  statsByGame: Record<string, GameStat>; // The Record<string, ...> is the index signature
}

// --- HARDCODED DATA OBJECT ---
// This object now conforms to the UserStats interface we defined above.
const hardcodedStats: UserStats = {
  userName: "Anshu",
  lastActive: "8/15/2025",
  statsByGame: {
    MoneyConceptGame: {
      gameId: 'MoneyConceptGame',
      gameName: 'Money Game',
      attempts: 7,
      currentLevel: 1,
      maxLevel: 5,
      independentSolutions: 7,
      hintSolutions: 0,
      needsPractice: 0,
    },
    AddSubBubblesGame: {
      gameId: 'AddSubBubblesGame',
      gameName: 'Addition Bubbles',
      attempts: 9,
      currentLevel: 1,
      maxLevel: 5,
      independentSolutions: 8,
      hintSolutions: 1,
      needsPractice: 0,
    }
  }
};

// --- Reusable Components ---

const StatBox = ({ icon, label, value }: { icon: any; label:string; value: string | number }) => (
  <View style={styles.statBox}>
    <MaterialCommunityIcons name={icon} size={28} color="#4D8080" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BreakdownRow = ({ color, label, value }: { color: string; label: string; value: number }) => (
  <View style={styles.breakdownRow}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={styles.breakdownValue}>{value}</Text>
  </View>
);

// The prop 'gameStat' is now correctly typed as GameStat
const GameReportCard = ({ gameStat }: { gameStat: GameStat }) => {
  const progress = (gameStat.currentLevel - 1) / gameStat.maxLevel;

  return (
    <View style={styles.card}>
      <Text style={styles.gameTitle}>{gameStat.gameName}</Text>
      <Text style={styles.levelText}>Level {gameStat.currentLevel} of {gameStat.maxLevel}</Text>
      
      <Text style={styles.sectionTitle}>Progress</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.miniStatsRow}>
        <View style={styles.miniStat}>
          <MaterialCommunityIcons name="target-account" size={20} color="#4D8080" />
          <Text style={styles.miniStatValue}>{gameStat.attempts}</Text>
          <Text style={styles.miniStatLabel}>Attempted</Text>
        </View>
        <View style={styles.miniStat}>
          <MaterialCommunityIcons name="progress-check" size={20} color="#4D8080" />
          <Text style={styles.miniStatValue}>{gameStat.currentLevel}</Text>
          <Text style={styles.miniStatLabel}>Current Level</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Learning Independence</Text>
      <BreakdownRow color="#f9a825" label="Independent" value={gameStat.independentSolutions} />
      <BreakdownRow color="#4caf50" label="Partially Dependent" value={gameStat.hintSolutions} />
      <BreakdownRow color="#ef5350" label="Needs Practice" value={gameStat.needsPractice} />
    </View>
  );
};

// --- Main Profile Screen Component ---
export default function ProfileScreen() {
  const stats = hardcodedStats;
  const allGameStats = Object.values(stats.statsByGame);
  const totalGamesPlayed = allGameStats.length;
  const totalIndependent = allGameStats.reduce((sum, game) => sum + game.independentSolutions, 0);
  const totalWithHints = allGameStats.reduce((sum, game) => sum + game.hintSolutions, 0);
  const totalNeedsPractice = allGameStats.reduce((sum, game) => sum + game.needsPractice, 0);
  const totalProblemsAttempted = totalIndependent + totalWithHints + totalNeedsPractice;
  const totalSolutions = totalIndependent + totalWithHints;
  const independenceRate = totalSolutions > 0 ? Math.round((totalIndependent / totalSolutions) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{stats.userName}'s Learning Journey</Text>
      <View style={styles.dateContainer}>
        <MaterialCommunityIcons name="calendar-blank" size={16} color="#4D8080" />
        <Text style={styles.subtitle}>Last active: {stats.lastActive}</Text>
      </View>
      
      {/* Overall Stats */}
      <View style={[styles.card, styles.overallStatsCard]}>
        <StatBox icon="book-open-variant" label="Games Played" value={totalGamesPlayed} />
        <StatBox icon="target" label="Problems Attempted" value={totalProblemsAttempted} />
        <StatBox icon="trending-up" label="Independence" value={`${independenceRate}%`} />
      </View>
      
      {/* Breakdown Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Learning Independence Breakdown</Text>
        <BreakdownRow color="#f9a825" label="Independent Solutions" value={totalIndependent} />
        <BreakdownRow color="#4caf50" label="With Hints" value={totalWithHints} />
        <BreakdownRow color="#ef5350" label="Needs More Practice" value={totalNeedsPractice} />
      </View>

      {/* Game-by-Game Reports Title */}
      <Text style={styles.reportsTitle}>Game-by-Game Reports</Text>
      {allGameStats.map(gameStat => (
        <GameReportCard key={gameStat.gameId} gameStat={gameStat} />
      ))}
    </ScrollView>
  );
}

// --- NEW STYLESHEET (Dashboard Theme Applied) ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E0EFFF', // Palette: Soft Powder Blue background
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 40 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4D8080', // Palette: Muted Teal for text
    textAlign: 'center',
    marginTop: 60,
  },
  subtitle: {
    fontSize: 14,
    color: '#4D8080',
    textAlign: 'center',
    marginLeft: 6,
  },
  dateContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginVertical: 8,
    marginBottom: 20,
  },
  reportsTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4D8080', 
    marginTop: 24, 
    marginBottom: 10, 
    paddingLeft: 4 
  },
  
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4D8080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  overallStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: { 
    flex: 1, 
    alignItems: 'center',
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4D8080', 
    marginTop: 8 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#4D8080', 
    textAlign: 'center', 
    marginTop: 4 
  },
  
  gameTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4D8080' 
  },
  levelText: { 
    fontSize: 14, 
    color: '#5f8a8a', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#4D8080', 
    marginBottom: 12,
  },
  
  progressBarBackground: { 
    height: 8, 
    backgroundColor: '#cce0e0', 
    borderRadius: 4, 
    overflow: 'hidden', 
    marginBottom: 16 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#4D8080', 
    borderRadius: 4 
  },
  
  miniStatsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 16, 
    backgroundColor: '#f7fafa', 
    borderRadius: 8, 
    paddingVertical: 12 
  },
  miniStat: { 
    alignItems: 'center', 
    flex: 1 
  },
  miniStatValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4D8080' 
  },
  miniStatLabel: { 
    fontSize: 12, 
    color: '#5f8a8a', 
    marginTop: 2 
  },
  
  breakdownRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 12 
  },
  breakdownLabel: { 
    flex: 1, 
    fontSize: 14, 
    color: '#4D8080' 
  },
  breakdownValue: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#4D8080' 
  },
});

