import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image'; // For GIF playback
import { GameFlowManager } from '../utils/GameFlowManager';

const { width, height } = Dimensions.get('window');

const ASSETS = {
  background: require('../../assets/bg5.jpg'),
  bubbles:[ 
    require('../../assets/ui/icons8-bubble-100.png'),
    require('../../assets/ui/icons_bubbles_green.png'),
    require('../../assets/ui/icons_bubbles_pink.png'),
    require('../../assets/ui/icons_bubbles_purple.png'),
    require('../../assets/ui/icons_bubbles_yellow.png'),
  ],
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

const numberWords = ["zero","one","two","three","four","five","six","seven","eight","nine"];

export default function BubbleCountingGame() {
  const [target, setTarget] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number, popped: boolean, highlighted: boolean, x: number, y: number, colorIndex: number }[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  const managerRef = useRef(new GameFlowManager()).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startNewProblem();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function startNewProblem() {
    const newTarget = Math.floor(Math.random() * 10);
    setTarget(newTarget);
    setPoppedCount(0);
    managerRef.resetLevel();

    const bubbleCount = newTarget + Math.floor(Math.random() * 6) + 3;
    const newBubbles = Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      popped: false,
      highlighted: false,
      x: Math.random() * (width - 100),
      y: Math.random() * (height - 300) + 150,
      colorIndex: Math.floor(Math.random() * ASSETS.bubbles.length) // Assigns a random color
  }));
    setBubbles(newBubbles);
  }

  function popBubble(id: number) {
    setBubbles(prev =>
      prev.map(b => {
        if (b.id === id && !b.popped) {
          setPoppedCount(prevCount => prevCount + 1);
          return { ...b, popped: true, highlighted: false };
        }
        return b;
      })
    );
  }

  function checkAnswer() {
    const correct = poppedCount === target;
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

    setBubbles(prev => {
      let highlightCount = 0;
      return prev.map(b => {
        if (!b.popped && highlightCount < managerRef.hintLevel && highlightCount < target) {
          highlightCount++;
          return { ...b, highlighted: true };
        }
        return b;
      });
    });
  }

  function playSolutionAnimation() {
    managerRef.hintLevel = 3;
    managerRef.status = 'dependent';

    let delay = 0;
    bubbles.forEach((bubble, index) => {
      if (!bubble.popped && index < target) {
        setTimeout(() => {
          popBubble(bubble.id);
        }, delay);
        delay += 300;
      }
    });
  }

  return (
    <View style={styles.container}>
      <Image source={ASSETS.background} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Target Number + Word */}
      <Text style={styles.targetText}>{target}</Text>
      <Text style={styles.targetWord}>{numberWords[target]}</Text>

      {/* Popped Counter */}
      <Text style={styles.counter}>Popped: {poppedCount} / {target}</Text>

      {/* Bubbles */}
      {bubbles.map(bubble => !bubble.popped && (
        <TouchableOpacity
          key={bubble.id}
          style={[styles.bubbles, { top: bubble.y, left: bubble.x }]}
          onPress={() => popBubble(bubble.id)}
        >
          <Animated.Image
            source={ASSETS.bubbles[bubble.colorIndex]}
            style={[
              { width: 50, height: 50 },
              bubble.highlighted && { transform: [{ scale: pulseAnim }] }
            ]}
          />
        </TouchableOpacity>
      ))}

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
  targetText: {
    fontSize: 64,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  targetWord: {
      fontSize: 32,
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 5,
  },
  counter: {
      fontSize: 24,
      color: '#FFD166',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
  },
  bubbles: { position: 'absolute' },
  buttonRow: { position: 'absolute', bottom: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' },
  icon: { width: 50, height: 50 },
  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 150, height: 150, resizeMode: 'contain' },
});