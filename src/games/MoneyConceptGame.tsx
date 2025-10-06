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
  background: require('../../assets/moneygame/moneygame_bg.png'),
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

// ---------- MONEY GAME ASSETS ----------
// Name your images exactly like this or update the requires below.
// Coins: 60x60. Notes: 100x50. Transparent PNGs.
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
  500: require('../../assets/moneygame/notes/r500.png'),
};

// Optional real-life items for L3+ (replace with your own PNGs)
const ITEM_IMGS: Array<{ name: string; priceRange: [number, number]; src: any }> = [
  { name: 'Milk', priceRange: [20, 260], src: require('../../assets/moneygame/items/milk.png') },
  { name: 'Bread', priceRange: [20, 260], src: require('../../assets/moneygame/items/bread.png') },
  { name: 'Pencil', priceRange: [5, 100], src: require('../../assets/moneygame/items/pencil.png') },
  { name: 'Shoes', priceRange: [300, 1500], src: require('../../assets/moneygame/items/shoes.png') },
];

// ---------- LEVELS ----------
type LevelSpec = {
  id: number;
  name: string;
  pool: number[];              // available denominations
  targetRange: [number, number];
  showItem: boolean;
};
const LEVELS: LevelSpec[] = [
  // L1: Recognition – we still implement via "make X rupees" with very small target using single denomination
  { id: 1, name: 'Denomination Recognition', pool: [1, 2, 5, 10], targetRange: [1, 10], showItem: false },
  // L2: Coins only small sums
  { id: 2, name: 'Add with Coins', pool: [1, 2, 5, 10, 20], targetRange: [10, 30], showItem: false },
  // L3: Mixed (introduce Rs10, Rs20 notes with coins)
  { id: 3, name: 'Coins + Small Notes', pool: [1, 2, 5, 10, 20, 50], targetRange: [30, 60], showItem: true },
  // L4: Larger values with objects
  { id: 4, name: 'Larger Values', pool: [1, 2, 5, 10, 20, 50, 100], targetRange: [60, 150], showItem: true },
  // L5: Multi-item context (we randomize higher sums)
  { id: 5, name: 'Context Purchases', pool: [1, 2, 5, 10, 20, 50, 100], targetRange: [150, 300], showItem: true },
  // L6+: Very large sums, include 500
  { id: 6, name: 'Big Sums', pool: [1, 2, 5, 10, 20, 50, 100, 500], targetRange: [300, 600], showItem: true },
];

// ---------- HELPERS ----------
const isCoin = (v: number) => v <= 20;
const formatRs = (n: number) => `₹${n}`;
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Greedy combo (works well with canonical coin systems & these pools)
function makeChangeGreedy(target: number, pool: number[]): number[] {
  const sorted = [...pool].sort((a, b) => b - a);
  const picks: number[] = [];
  let remaining = target;
  for (const d of sorted) {
    while (remaining >= d) {
      picks.push(d);
      remaining -= d;
      // avoid infinite loops
      if (picks.length > 1000) return [];
    }
  }
  if (remaining !== 0) {
    // Fallback: try simple backoff by replacing one high denom with smaller (basic heuristic)
    // For this game, pools chosen should usually be solvable by greedy.
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

  // Hints
  const [hintLevel, setHintLevel] = useState(0);
  const [hintHighlights, setHintHighlights] = useState<number[]>([]);

  // Overlays
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

    // choose item if level requires
    let chosenTarget = randInt(level.targetRange[0], level.targetRange[1]);
    let chosenItem: { name: string; src: any } | null = null;

    if (level.showItem && ITEM_IMGS.length) {
      const idx = Math.floor(Math.random() * ITEM_IMGS.length);
      const itemDef = ITEM_IMGS[idx];
      chosenTarget = randInt(itemDef.priceRange[0], itemDef.priceRange[1]);
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
    manager.resetLevel(); // resetAttemptsOnly() removed for NOW
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
          // Advance only if independent or partial (manager handles status by attempts/hints)
          if (manager.status === 'dependent') {
            // stay on same level with new problem
            startNewProblem();
            return;
          }
          // advance level or new problem if last
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
    manager.updateHints(); // increments internal hintLevel after thresholds
    // We mirror a simple 3-step hint plan:
    const newLevel = Math.min(3, hintLevel + 1);
    setHintLevel(newLevel);

    // Compute a valid combo (greedy)
    const combo = makeChangeGreedy(target, level.pool);
    if (!combo.length) return;

    if (newLevel === 1) {
      // highlight one needed denomination
      setHintHighlights([combo[0]]);
    } else if (newLevel === 2) {
      // highlight two denominations
      setHintHighlights(combo.slice(0, Math.min(2, combo.length)));
    } else if (newLevel === 3) {
      // pre-fill a partial combo (about half of the sum)
      const halfway = Math.max(1, Math.floor(combo.length / 2));
      setSelected(combo.slice(0, halfway));
      setHintHighlights(combo.slice(halfway, Math.min(combo.length, halfway + 2)));
    }
  }

  // Solution: animate placing the full correct combo
  function onSolution() {
    manager.hintLevel = 3;
    manager.status = 'dependent';

    const combo = makeChangeGreedy(target, level.pool);
    if (!combo.length) {
      // no valid greedy combo – just reset
      setSelected([]);
      return;
    }

    setSelected([]);
    setHintHighlights([]);
    let t = 0;
    combo.forEach((den, i) => {
      setTimeout(() => setSelected(prev => [...prev, den]), t);
      t += 250;
    });

    // After animation ends, present a *new* randomized problem at the same level
    setTimeout(() => startNewProblem(), t + 400);
  }

  // UI lists
  const coinPool = level.pool.filter(isCoin).sort((a, b) => a - b);
  const notePool = level.pool.filter(v => !isCoin(v)).sort((a, b) => a - b);

  return (
    <View style={styles.container}>
      {/* <Image source={ASSETS.background} style={StyleSheet.absoluteFillObject} resizeMode="cover" /> */}

      <Image
        source={ASSETS.background}
        style={[
          StyleSheet.absoluteFillObject,
          { width: '100%', height: '100%', resizeMode: 'stretch' }
        ]}
      />

      {/* Header / Question */}
      <View style={styles.header}>
        <Text style={styles.levelTitle }>Level {level.id}</Text>
        <Text style={styles.question}>
          {item
            ? `Pay for ${item.name}: ${formatRs(target)}`
            : `Select coins/notes to make ${formatRs(target)}`}
        </Text>
      </View>

      {/* Item image for context (L3+) */}
      {item && (
        <View style={styles.itemWrap}>
          <Image source={item.src} style={styles.itemImg} />
        </View>
      )}

      {/* Selected Tray + Total */}
      <View style={styles.selectedTray}>
        <Text style={styles.totalText}>Total:    {formatRs(total)} / {formatRs(target)}</Text>
      </View>

      <View style={styles.selectedTray}>
        <Text style={styles.totalText2}>    {formatRs(total)} </Text>
      </View>

      {/* Selection Tray */}
      <View style={styles.tray}>
        {/* Coins */}
        {!!coinPool.length && (
          <View style={styles.trayRow}>
            {coinPool.map(den => {
              const highlighted = hintHighlights.includes(den);
              return (
                <TouchableOpacity key={`c-${den}`} onPress={() => onPick(den)} activeOpacity={0.8}>
                  <Animated.View style={[styles.pickWrap, highlighted && styles.highlight]}>
                    <Image source={COIN_IMGS[den]} style={styles.coin} resizeMode="contain" />
                    <Text style={styles.pickLabel}>{formatRs(den)}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}

          </View>

        )}
        {/* Notes */}
        {!!notePool.length && (
          <View style={styles.trayRow}>
            {notePool.map(den => {
              const highlighted = hintHighlights.includes(den);
              return (
                <TouchableOpacity key={`n-${den}`} onPress={() => onPick(den)} activeOpacity={0.8}>
                  <Animated.View style={[styles.pickWrap, highlighted && styles.highlight]}>
                    <Image source={NOTE_IMGS[den]} style={styles.note} resizeMode="contain" />
                    <Text style={styles.pickLabel}>{formatRs(den)}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.selectedRow}>
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
          <ExpoImage source={ASSETS.celebrate} style={styles.overlayImage} autoplay />
        </Animated.View>
      )}
      {showIncorrect && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: incorrectAnim }] }]}>
          <ExpoImage source={ASSETS.incorrect} style={styles.overlayImage} autoplay />
        </Animated.View>
      )}
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginTop: 36, alignItems: 'center' },
  levelTitle: { color: '#2a1500ff', fontSize: 16 , fontFamily: 'PixelFont', left: -140 , marginTop: 10},
  question: { color: '#ff8000ff', fontSize: 22, fontWeight: 'bold', fontFamily: 'PixelFont', top: 80 },

  itemWrap: { alignItems: 'center', marginTop: 10 },
  itemImg: { width: 90, height: 90, resizeMode: 'contain', top: 70 },

  trayContainer: {
    position: 'absolute',
    bottom: 150, // adjust distance from bottom
    width: '100%',
    alignItems: 'center',
  },

  tray: {
    marginTop: -10,
    width: '100%',
    paddingHorizontal: 12,
    // backgroundColor: 'rgba(21, 2, 2, 0.25)',
  },

  trayRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 2,
    // backgroundColor: 'rgba(21, 2, 2, 0.25)',
  },

  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 10,
    paddingVertical: 0,
    paddingHorizontal: 12,
    
    // backgroundColor: 'rgba(255, 0, 0, 0.25)',
  },

  pickWrap: { alignItems: 'center' },
  highlight: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#ff8000ff',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  totalText: {
    color: '#ff8000ff', fontSize: 20,
    marginTop: 10,
    left: 16,
    textAlign: 'center',
    fontFamily: 'PixelFont',
    lineHeight: 40
  },
  totalText2:{
    color: '#ff8000ff', fontSize: 28,
    marginTop: -30,
    position: 'absolute',
    left: -190,
    textAlign: 'center',
    fontFamily: 'PixelFont',
    lineHeight: 40
  },
  selectedTray: {
    alignItems: 'center',
    marginHorizontal: 100,
    paddingVertical: 1,
    top: 300,
    left: 65,
    // backgroundColor: 'rgba(21, 2, 2, 0.25)'
  },
  coin: { width: 60, height: 60 },
  note: { width: 100, height: 50 },

  coinPicked: { width: 48, height: 48, marginRight: 6 },
  notePicked: { width: 80, height: 40, marginRight: 6 },
  pickLabel: { color: '#ffd500ff', fontSize: 12, marginTop: 4, textAlign: 'center', fontFamily: 'PixelFont'},

  buttonRow: {
    position: 'absolute',
    bottom: 26,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  icon: { width: 50, height: 50 },

  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 160, height: 160, resizeMode: 'contain' },
});
