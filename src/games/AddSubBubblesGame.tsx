import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GameFlowManager } from '../utils/GameFlowManager';

const { width, height } = Dimensions.get('window');

const ASSETS = {
  background: require('../../assets/addsub_bg1.png'),
  bubble: require('../../assets/ui/icons8-bubble-100.png'),
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

export default function AddSubBubblesGame() {
  const [currentProblem, setCurrentProblem] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [availableBubbles, setAvailableBubbles] = useState<{ id: number, value: number, x: number, y: number }[]>([]);
  const [trayBubbles, setTrayBubbles] = useState<{ id: number, value: number }[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  const managerRef = useRef(new GameFlowManager()).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;
  const resultBubbleAnim = useRef(new Animated.Value(1)).current;
  const [availableLayout, setAvailableLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [trayLayout, setTrayLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [flyingBubble, setFlyingBubble] = useState<{
    visible: boolean;
    value: number;
    animX: Animated.Value;
    animY: Animated.Value;
  } | null>(null);

  useEffect(() => {
    startNewProblem();
  }, []);

  function startNewProblem() {
    // Ensure subtraction stays non-negative and numbers stay small
    const operator = Math.random() > 0.5 ? '+' : '-';
    let num1 = Math.floor(Math.random() * 9) + 1;
    let num2 = Math.floor(Math.random() * 9) + 1;
    if (operator === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    const answer = operator === '+' ? num1 + num2 : num1 - num2;

    setCurrentProblem({ num1, num2, operator, answer });
    setTrayBubbles([]);
    managerRef.resetLevel();

    // Create available bubbles with various numbers
    let bubbleValues: number[];
    if (operator === '+') {
      // For addition: use numbers 1-10
      bubbleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } else {
      // For subtraction: include the answer and numbers that can help reach it
      bubbleValues = [answer, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      // Also include num1 and num2 to help with understanding
      if (!bubbleValues.includes(num1)) bubbleValues.push(num1);
      if (!bubbleValues.includes(num2)) bubbleValues.push(num2);
    }
    
    const shuffledValues = bubbleValues.sort(() => Math.random() - 0.5);
    const columns = Platform.OS === 'web' ? 5 : 4; // Fewer columns on mobile
    const cellWidth = width / columns;
    const cellHeight = Platform.OS === 'web' ? 80 : 70; // Smaller height on mobile
    
    const newBubbles = shuffledValues.slice(0, 8).map((value, index) => ({
      id: index,
      value,
      x: (index % columns) * cellWidth + (cellWidth - 50) / 2,
      y: Math.floor(index / columns) * cellHeight,
    }));
    
    setAvailableBubbles(newBubbles);
  }

  function addBubbleToTray(bubbleId: number) {
    const bubble = availableBubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    // If we have layout info, animate a flying bubble to the tray
    if (availableLayout && trayLayout) {
      const startX = availableLayout.x + bubble.x;
      const startY = availableLayout.y + bubble.y;
      const endX = trayLayout.x + trayLayout.width / 2 - 25;
      const endY = trayLayout.y + 20; // near top of tray container

      const animX = new Animated.Value(startX);
      const animY = new Animated.Value(startY);
      setFlyingBubble({ visible: true, value: bubble.value, animX, animY });

      // Hide from available while flying
      setAvailableBubbles(prev => prev.filter(b => b.id !== bubbleId));

      Animated.parallel([
        Animated.timing(animX, { toValue: endX, duration: 400, useNativeDriver: false }),
        Animated.timing(animY, { toValue: endY, duration: 400, useNativeDriver: false }),
      ]).start(() => {
        setFlyingBubble(null);
        setTrayBubbles(prev => [...prev, { id: bubble.id, value: bubble.value }]);
        Animated.sequence([
          Animated.timing(resultBubbleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
          Animated.timing(resultBubbleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      });
      return;
    }

    // Fallback without layout info
    setTrayBubbles(prev => [...prev, { id: bubble.id, value: bubble.value }]);
    setAvailableBubbles(prev => prev.filter(b => b.id !== bubbleId));
    Animated.sequence([
      Animated.timing(resultBubbleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(resultBubbleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function removeBubbleFromTray(bubbleId: number) {
    const bubble = trayBubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    setTrayBubbles(prev => prev.filter(b => b.id !== bubbleId));
    
    // Add back to available bubbles with a new position
    const columns = Platform.OS === 'web' ? 5 : 4;
    const cellWidth = width / columns;
    const cellHeight = Platform.OS === 'web' ? 80 : 70;
    
    // Find an empty spot in the grid
    const existingPositions = availableBubbles.map(b => ({ x: b.x, y: b.y }));
    let newX: number, newY: number;
    let attempts = 0;
    
    do {
      const col = Math.floor(Math.random() * columns);
      const row = Math.floor(Math.random() * 2); // Only 2 rows
      newX = col * cellWidth + (cellWidth - 50) / 2;
      newY = row * cellHeight;
      attempts++;
    } while (
      attempts < 20 && 
      existingPositions.some(pos => 
        Math.abs(pos.x - newX) < 60 && Math.abs(pos.y - newY) < 60
      )
    );
    
    setAvailableBubbles(prev => [...prev, { 
      id: bubble.id, 
      value: bubble.value, 
      x: newX,
      y: newY
    }]);
  }

  function checkAnswer() {
    const traySum = trayBubbles.reduce((sum, bubble) => sum + bubble.value, 0);
    let correct = false;
    
    if (currentProblem.operator === '+') {
      // For addition: sum should equal the answer
      correct = traySum === currentProblem.answer;
    } else {
      // For subtraction: we need to handle this differently
      // Option 1: Find the missing number (what needs to be subtracted from num1 to get num2)
      // Option 2: Use the answer directly
      correct = traySum === currentProblem.answer;
    }
    
    managerRef.recordAttempt(correct);

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

  function showHint() {
    managerRef.updateHints();
    if (managerRef.hintLevel === 0) return;

    // Highlight the correct bubbles
    const correctBubbles = availableBubbles.filter(b => b.value <= currentProblem.answer);
    if (managerRef.hintLevel >= 1) {
      // Could add visual hints here
    }
  }

  function playSolutionAnimation() {
    managerRef.hintLevel = 3;
    managerRef.status = 'dependent';

    if (currentProblem.operator === '+') {
      // For addition: find bubbles that sum to the answer
      const remainingBubbles = [...availableBubbles];
      let currentSum = 0;
      const bubblesToAdd = [];

      for (const bubble of remainingBubbles) {
        if (currentSum + bubble.value <= currentProblem.answer) {
          bubblesToAdd.push(bubble);
          currentSum += bubble.value;
          if (currentSum === currentProblem.answer) break;
        }
      }

      // Add bubbles to tray with delay
      bubblesToAdd.forEach((bubble, index) => {
        setTimeout(() => {
          addBubbleToTray(bubble.id);
        }, index * 300);
      });
    } else {
      // For subtraction: find the answer bubble directly, or bubbles that sum to it
      const answerBubble = availableBubbles.find(b => b.value === currentProblem.answer);
      if (answerBubble) {
        // If the answer bubble exists, use it
        setTimeout(() => {
          addBubbleToTray(answerBubble.id);
        }, 300);
      } else {
        // Otherwise, find bubbles that sum to the answer
        const remainingBubbles = [...availableBubbles];
        let currentSum = 0;
        const bubblesToAdd = [];

        for (const bubble of remainingBubbles) {
          if (currentSum + bubble.value <= currentProblem.answer) {
            bubblesToAdd.push(bubble);
            currentSum += bubble.value;
            if (currentSum === currentProblem.answer) break;
          }
        }

        bubblesToAdd.forEach((bubble, index) => {
          setTimeout(() => {
            addBubbleToTray(bubble.id);
          }, index * 300);
        });
      }
    }
  }

  const traySum = trayBubbles.reduce((sum, bubble) => sum + bubble.value, 0);
  const resultBubbleSize = Math.max(60, 40 + traySum * 3);

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

      {/* Problem Display */}
      <View style={styles.problemContainer}>
        <Text style={styles.problemText}>
          {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
        </Text>
        {/* <Text style={styles.instructionText}>
          {currentProblem.operator === '+' 
            ? 'Add bubbles to match the answer' 
            : 'Find the answer bubble or add bubbles that equal the answer'
          }
        </Text> */}
      </View>

      {/* Bubble Tray */}
      <View style={styles.trayContainer} onLayout={e => setTrayLayout(e.nativeEvent.layout)}>
        <Text style={styles.trayLabel}>Bubble Tray</Text>
        <View style={styles.tray}>
          {trayBubbles.map(bubble => (
            <TouchableOpacity
              key={bubble.id}
              style={styles.trayBubble}
              onPress={() => removeBubbleFromTray(bubble.id)}
            >
              <Image source={ASSETS.bubble} style={styles.bubbleImage} />
              <Text style={styles.bubbleValue}>{bubble.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Result Bubble */}
        <View style={styles.resultContainer}>
          <Animated.View 
            style={[
              styles.resultBubble, 
              { 
                width: resultBubbleSize, 
                height: resultBubbleSize,
                transform: [{ scale: resultBubbleAnim }]
              }
            ]}
          >
            <Image source={ASSETS.bubble} style={[styles.resultBubbleImage, { width: resultBubbleSize, height: resultBubbleSize }]} />
            <Text style={styles.resultText}>{traySum}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Available Bubbles */}
      <View style={styles.availableContainer}>
        <Text style={styles.availableLabel}>Available Bubbles</Text>
        <View style={styles.availableBubbles} onLayout={e => setAvailableLayout(e.nativeEvent.layout)}>
          {availableBubbles.map(bubble => (
            <TouchableOpacity
              key={bubble.id}
              style={[styles.availableBubble, { top: bubble.y, left: bubble.x }]}
              onPress={() => addBubbleToTray(bubble.id)}
              activeOpacity={0.7}
            >
              <Image source={ASSETS.bubble} style={styles.bubbleImage} />
              <Text style={styles.bubbleValue}>{bubble.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={startNewProblem}>
          <Image source={ASSETS.reset} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={showHint}>
          <Image source={ASSETS.hint} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={playSolutionAnimation}>
          <Image source={ASSETS.solution} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={checkAnswer}>
          <Image source={ASSETS.submit} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Flying bubble animation overlay */}
      {flyingBubble?.visible && (
        <Animated.View style={[styles.flyingBubble, { left: flyingBubble.animX, top: flyingBubble.animY }]}> 
          <Image source={ASSETS.bubble} style={styles.bubbleImage} />
          <Text style={styles.bubbleValue}>{flyingBubble.value}</Text>
        </Animated.View>
      )}

      {/* Celebrate Overlay */}
      {showCelebrate && (
        <Animated.View style={[styles.overlay, { transform: [{ scale: celebrateAnim }] }]}>
          <ExpoImage
            source={ASSETS.celebrate}
            style={styles.overlayImage}
            contentFit="contain"
            autoplay
          />
        </Animated.View>
      )}

      {/* Incorrect Overlay */}
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
  problemContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 400 : 200,
    marginBottom: 20,
    color: 'darkblue',
  },
  problemText: {
    fontSize: 24,
    color: '#fb8943ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginBottom: 10,
  },
  // instructionText: {
  //   fontSize: 16,
  //   color: '#fff',
  //   fontFamily: 'PixelFont',
  //   textAlign: 'center',
  //   marginBottom: 20,
  // },
  trayContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    marginTop: 160,
    borderColor: '#1f0086ff',
  },
  trayLabel: {
    fontSize: 18,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginBottom: 10,
  },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: -10,
  },
  trayBubble: {
    position: 'relative',
    margin: 5,
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  resultBubble: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBubbleImage: {
    position: 'absolute',
  },
  resultText: {
    fontSize: 20,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
  },
  availableContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 180,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 249, 249, 0.3)',
    paddingVertical: 5,
  },
  availableLabel: {
    fontSize: 18,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginBottom: 10,
  },
  availableBubbles: {
    position: 'relative',
    height: Platform.OS === 'web' ? 160 : 140,
    paddingHorizontal: 10,
  },
  availableBubble: {
    position: 'absolute',
    zIndex: 10,
  },
  bubbleImage: {
    width: 50,
    height: 50,
  },
  bubbleValue: {
    fontSize: 18,
    color: '#1f0086ff',
    fontFamily: 'PixelFont',
    textAlign: 'center',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    padding:9,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(133, 172, 239, 0.8)',
    justifyContent: 'space-evenly',
  },
  icon: {
    width: 50,
    height: 50,
  }, 
  overlay: {
    position: 'absolute',
    top: '40%',
    left: '35%',
    zIndex: 10,
  },
  overlayImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  flyingBubble: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 100,
  },
});
