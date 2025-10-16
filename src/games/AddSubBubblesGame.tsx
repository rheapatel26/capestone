import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GameFlowManager } from '../utils/GameFlowManager';

const { width } = Dimensions.get('window');

const ASSETS = {
  background: require('../../assets/addsub/addsub_bg1.png'),

  bubble: require('../../assets/bubbleCount/icons8-bubble-100.png'),
  bubbles: [
    require('../../assets/addsub/UI_bubbles/1.png'), // 0
    require('../../assets/addsub/UI_bubbles/2.png'),
    require('../../assets/addsub/UI_bubbles/3.png'),
    require('../../assets/addsub/UI_bubbles/4.png'),
    require('../../assets/addsub/UI_bubbles/5.png'),
    require('../../assets/addsub/UI_bubbles/6.png'),
    require('../../assets/addsub/UI_bubbles/7.png'),
    require('../../assets/addsub/UI_bubbles/8.png'),
    require('../../assets/addsub/UI_bubbles/9.png'),
    require('../../assets/addsub/UI_bubbles/10.png'),
  ],
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

export default function AddSubBubblesGame() {
  const [currentProblem, setCurrentProblem] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [trayBubbles, setTrayBubbles] = useState<{ id: number; value: number }[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const managerRef = useRef(new GameFlowManager()).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;
  const resultBubbleAnim = useRef(new Animated.Value(1)).current;
  const [level, setLevel] = useState(1);
  const totalLevels = 10;

  useEffect(() => {
    startNewProblem();
  }, []);

  function startNewProblem() {
    const operator = level <= totalLevels / 2 ? '+' : '-';
    setLevel(prev => (prev % totalLevels) + 1);
    let num1 = Math.floor(Math.random() * 9) + 1;
    let num2 = Math.floor(Math.random() * 9) + 1;
    if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
    const answer = operator === '+' ? num1 + num2 : num1 - num2;

    setCurrentProblem({ num1, num2, operator, answer });
    setTrayBubbles([]);
    managerRef.resetLevel();
  }

  function addBubbleToTray(value: number) {
    const id = Date.now();
    setTrayBubbles(prev => [...prev, { id, value }]);
    Animated.sequence([
      Animated.timing(resultBubbleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(resultBubbleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function removeBubbleFromTray(bubbleId: number) {
    setTrayBubbles(prev => prev.filter(b => b.id !== bubbleId));
  }

  function checkAnswer() {
    const traySum = trayBubbles.reduce((sum, bubble) => sum + bubble.value, 0);
    const correct = traySum === currentProblem.answer;
    managerRef.recordAttempt(correct);
    correct ? triggerCelebrate() : triggerIncorrect();
  }

  function triggerCelebrate() {
    setShowCelebrate(true);
    Animated.spring(celebrateAnim, { toValue: 1, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.spring(celebrateAnim, { toValue: 0, useNativeDriver: true }).start(() => {
          setShowCelebrate(false);
          startNewProblem();
        });
      }, 2000);
    });
  }

  function triggerIncorrect() {
    setShowIncorrect(true);
    Animated.spring(incorrectAnim, { toValue: 1, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.spring(incorrectAnim, { toValue: 0, useNativeDriver: true }).start(() => {
          setShowIncorrect(false);
        });
      }, 1500);
    });
  }

    // -------------------------
  // Hint and Solution helpers
  // -------------------------
  function showHint() {
    // ask manager to advance hint level (keeps original behavior)
    managerRef.updateHints();
    if (managerRef.hintLevel === 0) return;

    // Try to provide a small helpful hint: add first usable bubble toward the answer
    const answer = currentProblem.answer;
    // Candidate pool: 0..10
    const candidates = Array.from({ length: 11 }, (_, i) => i)
      // sort to prefer larger helpful numbers (optional)
      .sort((a, b) => b - a);

    // Find a number <= answer that helps reduce remaining sum
    let chosen: number | null = null;
    for (const c of candidates) {
      if (c > 0 && c <= answer) { chosen = c; break; }
    }
    // If nothing found (e.g., answer is 0), pick 0
    if (chosen === null) chosen = 0;

    // Add a single bubble as a gentle hint
    setTimeout(() => addBubbleToTray(chosen as number), 250);
  }

  function playSolutionAnimation() {
    // mark solution hint state in manager
    managerRef.hintLevel = 3;
    managerRef.status = 'dependent';

    // Build a greedy solution from available numbers 10..1..0
    const target = currentProblem.answer;
    if (target === 0) {
      // If answer is zero, just add 0
      setTimeout(() => addBubbleToTray(0), 300);
      return;
    }

    const pool = Array.from({ length: 10 }, (_, i) => i).sort((a,b) => b - a); // 10..0
    let sum = 0;
    const toAdd: number[] = [];

    for (const n of pool) {
      if (sum + n <= target) {
        toAdd.push(n);
        sum += n;
        if (sum === target) break;
      }
    }

    // If greedy failed (very unlikely for 0..10 target), fallback to adding target itself if <=10
    if (sum !== target && target <= 10) {
      toAdd.length = 0;
      toAdd.push(target);
    }

    // Animate adding those bubbles to the tray (non-destructive — they remain in tray)
    toAdd.forEach((val, idx) => {
      setTimeout(() => addBubbleToTray(val), idx * 300);
    });
  }


  const traySum = trayBubbles.reduce((sum, bubble) => sum + bubble.value, 0);
  const resultBubbleSize = Math.max(60, 40 + traySum * 3);

  return (
    <View style={styles.container}>
      <Image source={ASSETS.background} style={[StyleSheet.absoluteFillObject, {width:'100%',height:'100%', resizeMode:'stretch' }]} />

      {/* Problem Display */}
      <View style={styles.problemContainer}>
        <Text style={styles.problemText}>
          {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
        </Text>
      </View>

      {/* Bubble Tray */}
      <View style={styles.trayContainer}>
        {/* <Text style={styles.trayLabel}>Bubble Tray</Text> */}
        <View style={styles.tray}>
          {trayBubbles.map(bubble => (
            <TouchableOpacity key={bubble.id} style={styles.trayBubble} onPress={() => removeBubbleFromTray(bubble.id)}>
              <Image source={ASSETS.bubbles[bubble.value % ASSETS.bubbles.length]} style={styles.bubbleImage} />
              <Text style={styles.bubbleValue}>{bubble.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Result tray */}
        <View style={styles.resultContainer}>
          <Animated.View
            style={[
              styles.resultBubble,
              { width: resultBubbleSize, height: resultBubbleSize, transform: [{ scale: resultBubbleAnim }] },
            ]}
          >
            <Image source={ASSETS.bubble} style={[styles.resultBubbleImage, { width: resultBubbleSize, height: resultBubbleSize }]} />
            <Text style={styles.resultText}>{traySum}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Calculator Layout */}
      <View style={styles.availableContainer}>
        <View style={styles.calculatorGrid}>
          {/* 1–9 grid */}
          {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
            <TouchableOpacity key={num} style={styles.calcButton} onPress={() => addBubbleToTray(num)}>
              <Image source={ASSETS.bubbles[num % ASSETS.bubbles.length]} style={styles.bubbleImage} />
              <Text style={styles.bubbleValue}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Last row with centered 0 */}
        <View style={styles.lastRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.calcButton} onPress={() => addBubbleToTray(0)}>
            <Image source={ASSETS.bubbles[0]} style={styles.bubbleImage} />
            <Text style={styles.bubbleValue}>0</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={startNewProblem}>
          <Image source={ASSETS.reset} style={styles.icon} />
        </TouchableOpacity>

        {/* Hint button */}
        <TouchableOpacity onPress={showHint}>
          <Image source={ASSETS.hint} style={styles.icon} />
        </TouchableOpacity>

        {/* Solution button */}
        <TouchableOpacity onPress={playSolutionAnimation}>
          <Image source={ASSETS.solution} style={styles.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={checkAnswer}>
          <Image source={ASSETS.submit} style={styles.icon} />
        </TouchableOpacity>

      </View>

      {/* Celebration & Incorrect Overlays */}
      {showCelebrate && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: celebrateAnim }] }]}>
          <ExpoImage source={ASSETS.celebrate} style={styles.overlayImage} contentFit="contain" autoplay />
        </Animated.View>
      )}
      {showIncorrect && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: incorrectAnim }] }]}>
          <Image source={ASSETS.incorrect} style={styles.overlayImage} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  problemContainer: { alignItems: 'center', marginTop:200 },
  problemText: {
    fontSize: 24,
    color: '#fb8943ff',
    fontFamily: 'PixelFont',
  },
  trayContainer: {
    margin: 10,
    marginHorizontal: 20,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#1f0086ff',
  },
  trayLabel: {
    fontSize: 14,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginBottom: 10,
  },
  tray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  trayBubble: { margin: 5 },
  resultContainer: { alignItems: 'center' },
  resultBubble: { alignItems: 'center', justifyContent: 'center' },
  resultBubbleImage: { position: 'absolute' },
  resultText: {
    fontSize: 15,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
  },
  availableContainer: {
    position: 'relative',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 249, 249, 0.3)',
    paddingVertical: 20,
    marginTop:50,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 50,
  },
  calcButton: {
    width: 80,
    height: 80,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  bubbleImage: { width: 60, height: 60 },
  bubbleValue: {
    fontSize: 15,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(133, 172, 239, 0.8)',
    padding: 8,
  },
  icon: { width: 50, height: 50 },
  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 150, height: 150, resizeMode: 'contain' },
});

