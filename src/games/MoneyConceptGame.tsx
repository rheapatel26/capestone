import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GameFlowManager } from '../utils/GameFlowManager';

const { width } = Dimensions.get('window'); 

// ---------- SHARED ASSETS (same paths as your other games) ----------
const ASSETS = {
  // --- CHANGE: Updated background to bg1.gif ---
  background: require('../../assets/bg1.gif'),
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

// ---------- MONEY GAME ASSETS ----------
const COIN_IMGS: Record<number, any> = {
  1: require('../../assets/moneygame/coins/r1.png'),
  2: require('../../assets/moneygame/coins/r2.png'),
  5: require('../../assets/moneygame/coins/r5.png'),
  10: require('../../assets/moneygame/coins/r10.png'),
  20: require('../../assets/moneygame/coins/r20.png'),
};
const NOTE_IMGS: Record<number, any> = {
  10: require('../../assets/moneygame/notes/r10.png'),
  20: require('../../assets/moneygame/notes/r20.png'),
  50: require('../../assets/moneygame/notes/r50.png'),
  100: require('../../assets/moneygame/notes/r100.png'),
  200: require('../../assets/moneygame/notes/r200.png'),
  500: require('../../assets/moneygame/notes/r500.png'),
};

// --- CHANGE: Create a master list of all available money ---
const ALL_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500];

// --- YOUR UPDATED ITEMS ---
const ITEM_IMGS: Array<{ name: string; priceRange: [number, number]; src: any }> = [
  { name: 'Milk', priceRange: [20, 60], src: require('../../assets/moneygame/items/milk.png') },
  { name: 'Bread', priceRange: [20, 60], src: require('../../assets/moneygame/items/bread.png') },
  { name: 'Pencil', priceRange: [5, 20], src: require('../../assets/moneygame/items/pencil.png') },
  { name: 'Fruit', priceRange: [10, 40], src: require('../../assets/moneygame/items/apple.png') },
  { name: 'Shoes', priceRange: [150, 400], src: require('../../assets/moneygame/items/shoes.png') },
  { name: 'Book', priceRange: [15, 50], src: require('../../assets/moneygame/items/book.png') },
];


// ---------- LEVELS ----------
type LevelSpec = {
  id: number;
  name: string;
  pool: number[];          // available denominations
  targetRange: [number, number];
  showItem: boolean;
};
// --- CHANGE: Updated all levels to use ALL_DENOMINATIONS in their pool ---
const LEVELS: LevelSpec[] = [
  { id: 1, name: 'Level 1', pool: ALL_DENOMINATIONS, targetRange: [1, 10], showItem: true },
  { id: 2, name: 'Level 2', pool: ALL_DENOMINATIONS, targetRange: [6, 30], showItem: true },
  { id: 3, name: 'Level 3', pool: ALL_DENOMINATIONS, targetRange: [15, 60], showItem: true },
  { id: 4, name: 'Level 4', pool: ALL_DENOMINATIONS, targetRange: [25, 120], showItem: true },
  { id: 5, name: 'Level 5', pool: ALL_DENOMINATIONS, targetRange: [40, 150], showItem: true },
  { id: 6, name: 'Level 6', pool: ALL_DENOMINATIONS, targetRange: [80, 600], showItem: true },
  { id: 7, name: 'Level 7', pool: ALL_DENOMINATIONS, targetRange: [250, 800], showItem: true },
];

// ---------- HELPERS ----------
const isCoin = (v: number) => v <= 20;
const formatRs = (n: number) => `₹${n}`;
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function makeChangeGreedy(target: number, pool: number[]): number[] {
  const sorted = [...pool].sort((a, b) => b - a);
  const picks: number[] = [];
  let remaining = target;
  for (const d of sorted) {
    while (remaining >= d) {
      picks.push(d);
      remaining -= d;
      if (picks.length > 1000) return [];
    }
  }
  if (remaining !== 0) {
    return [];
  }
  return picks;
}

// ---------- COMPONENT ----------
export default function MoneyConceptGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  const manager = useRef(new GameFlowManager()).current;

  const [target, setTarget] = useState(10);
  const [item, setItem] = useState<{ name: string; src: any } | null>(null);

  const [selected, setSelected] = useState<number[]>([]);
  const total = useMemo(() => selected.reduce((a, b) => a + b, 0), [selected]);

  const [hintLevel, setHintLevel] = useState(0);
  const [hintHighlights, setHintHighlights] = useState<number[]>([]);

  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startNewProblem();
  }, [levelIndex]);

  function startNewProblem() {
    manager.resetLevel();
    setHintLevel(0);
    setHintHighlights([]);
    setSelected([]);

    let chosenTarget = randInt(level.targetRange[0], level.targetRange[1]);
    let chosenItem: { name: string; src: any } | null = null;

    if (level.showItem && ITEM_IMGS.length) {
      const idx = Math.floor(Math.random() * ITEM_IMGS.length);
      const itemDef = ITEM_IMGS[idx];
      const minTarget = Math.max(level.targetRange[0], itemDef.priceRange[0]);
      const maxTarget = Math.min(level.targetRange[1], itemDef.priceRange[1]);
      chosenTarget = randInt(minTarget, maxTarget);
      chosenItem = { name: itemDef.name, src: itemDef.src };
    }
    setItem(chosenItem);
    setTarget(chosenTarget);
  }

  function onPick(denom: number) {
    setSelected(prev => [...prev, denom]);
  }

  function onReset() {
    setSelected([]);
    setHintHighlights([]);
    manager.resetLevel();
  }

  function onSubmit() {
    const correct = total === target;
    manager.recordAttempt(correct);
    if (correct) {
      triggerCelebrate();
    } else {
      triggerIncorrect();
    }
  }

  function triggerCelebrate() {
    setShowCelebrate(true);
    Animated.spring(celebrateAnim, { toValue: 1, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.spring(celebrateAnim, { toValue: 0, useNativeDriver: true }).start(() => {
          setShowCelebrate(false);
          if (manager.status === 'dependent') {
            startNewProblem();
            return;
          }
          if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(levelIndex + 1);
          } else {
            startNewProblem();
          }
        });
      }, 1400);
    });
  }

  function triggerIncorrect() {
    setShowIncorrect(true);
    Animated.spring(incorrectAnim, { toValue: 1, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.spring(incorrectAnim, { toValue: 0, useNativeDriver: true }).start(() => {
          setShowIncorrect(false);
        });
      }, 1200);
    });
  }

  function onHint() {
    manager.updateHints();
    const newLevel = Math.min(3, hintLevel + 1);
    setHintLevel(newLevel);

    const combo = makeChangeGreedy(target, level.pool);
    if (!combo.length) return;

    if (newLevel === 1) {
      setHintHighlights([combo[0]]);
    } else if (newLevel === 2) {
      setHintHighlights(combo.slice(0, Math.min(2, combo.length)));
    } else if (newLevel === 3) {
      const halfway = Math.max(1, Math.floor(combo.length / 2));
      setSelected(combo.slice(0, halfway));
      setHintHighlights(combo.slice(halfway, Math.min(combo.length, halfway + 2)));
    }
  }

  function onSolution() {
    manager.hintLevel = 3;
    manager.status = 'dependent';

    const combo = makeChangeGreedy(target, level.pool);
    if (!combo.length) {
      setSelected([]);
      return;
    }

    setSelected([]);
    setHintHighlights([]);
    let t = 0;
    combo.forEach((den) => {
      setTimeout(() => setSelected(prev => [...prev, den]), t);
      t += 250;
    });

    setTimeout(() => startNewProblem(), t + 400);
  }

  return (
    <View style={styles.container}>
      <Image source={ASSETS.background} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Header / Question */}
      <View style={styles.header}>
        <Text style={styles.levelTitle}>Money Concept — {level.name}</Text>
        <Text style={styles.question}>
          {item
            ? `Pay for ${item.name}: ${formatRs(target)}`
            : `Select coins/notes to make ${formatRs(target)}`}
        </Text>
      </View>

      {/* Item image for context */}
      {item && (
        <View style={styles.itemWrap}>
          <Image source={item.src} style={styles.itemImg} />
        </View>
      )}

      {/* Selected Tray */}
      <View style={styles.selectedTray}>
        <Text style={styles.totalText}>Total: {formatRs(total)} / {formatRs(target)}</Text>
        <ScrollView contentContainerStyle={styles.selectedGrid}>
          {selected.map((den, idx) => {
            const isC = isCoin(den);
            const src = isC ? COIN_IMGS[den] : NOTE_IMGS[den];
            return (
              <Image
                key={`${den}-${idx}`}
                source={src}
                style={isC ? styles.coinPicked : styles.notePicked}
                resizeMode="contain"
              />
            );
          })}
        </ScrollView>
      </View>

      {/* --- CHANGE: Replaced static rows with a single horizontal ScrollView --- */}
      <View style={styles.tray}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollableTrayContainer}
        >
          {level.pool.map(den => {
            const highlighted = hintHighlights.includes(den);
            const isC = isCoin(den);
            const src = isC ? COIN_IMGS[den] : NOTE_IMGS[den];

            return (
              <TouchableOpacity key={`pick-${den}`} onPress={() => onPick(den)} activeOpacity={0.8}>
                <Animated.View style={[styles.pickWrap, highlighted && styles.highlight]}>
                  <Image source={src} style={isC ? styles.coin : styles.note} resizeMode="contain" />
                  <Text style={styles.pickLabel}>{formatRs(den)}</Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onReset}>
          <Image source={ASSETS.reset} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onHint}>
          <Image source={ASSETS.hint} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSolution}>
          <Image source={ASSETS.solution} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSubmit}>
          <Image source={ASSETS.submit} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Overlays */}
      {showCelebrate && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: celebrateAnim }] }]}>
          <ExpoImage source={ASSETS.celebrate} style={styles.overlayImage} contentFit="contain" />
        </Animated.View>
      )}
      {showIncorrect && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: incorrectAnim }] }]}>
          <ExpoImage source={ASSETS.incorrect} style={styles.overlayImage} contentFit="contain" />
        </Animated.View>
      )}
    </View>
  );
}

// ---------- STYLES (MODIFIED) ----------
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  header: { paddingTop: 40, alignItems: 'center' },
  levelTitle: { color: '#fff', fontSize: 14, marginBottom: 6 },
  question: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  itemWrap: { alignItems: 'center', marginTop: 10 },
  itemImg: { width: 90, height: 90, resizeMode: 'contain' },

  selectedTray: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 15,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    justifyContent: 'flex-start',
  },
  totalText: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinPicked: {
    width: 70,
    height: 70,
    margin: 6,
  },
  notePicked: {
    width: 110,
    height: 55,
    margin: 6,
  },

  tray: {
    width: '100%',
    paddingBottom: 110, // Make sure it's above the buttons
  },
  // --- CHANGE: New style for the scrollable container ---
  scrollableTrayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pickWrap: { 
    alignItems: 'center', 
    padding: 4,
    // --- CHANGE: Added horizontal margin for spacing in the scrollview ---
    marginHorizontal: 8,
  },
  highlight: {
    transform: [{ scale: 1.1 }],
    borderRadius: 10,
    backgroundColor: 'rgba(255, 209, 102, 0.3)',
    shadowColor: '#FFD166',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  coin: { width: 75, height: 75 },
  note: { width: 120, height: 60 },
  pickLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  buttonRow: {
    position: 'absolute',
    bottom: 26,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  icon: { width: 55, height: 55 },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  overlayImage: { width: width * 0.7, height: width * 0.7 },
});