import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GameFlowManager } from '../utils/GameFlowManager';

// ---------- ASSETS ----------
const ASSETS = {
  background: require('../../assets/bg1.gif'),
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
  clockFace: require('../../assets/clockgame/clock_face_pixel.png'),
  hourHand: require('../../assets/clockgame/hour_hand_pixel.png'),
  minuteHand: require('../../assets/clockgame/minute_hand_pixel.png'),
};

const LEVELS = [
  { id: 1, name: 'Hour Hand Only', minuteOptions: 'hourOnly' },
  { id: 2, name: 'Whole Hours', minuteOptions: [0] },
  { id: 3, name: 'Half Hours', minuteOptions: [30] },
  { id: 4, name: 'Quarter Hours', minuteOptions: [0, 15, 30, 45] },
  { id: 5, name: '5 Minute Increments', minuteOptions: 'all' },
  { id: 6, name: 'Real Life Scenarios', minuteOptions: 'all' },
];

const { width } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width, 420) * 0.8; // Slightly smaller to make room for switch
const CENTER = CLOCK_SIZE / 2;

function angleForTime(hours: number, minutes: number) {
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
  const minuteAngle = (minutes / 60) * 360;
  return { hourAngle, minuteAngle };
}

function snapMinuteToStep(rawMinutes: number, step = 5) {
  return (Math.round(rawMinutes / step) * step) % 60;
}

function polarToAngle(x: number, y: number) {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const rad = Math.atan2(dy, dx);
  const degFromRight = (rad * 180) / Math.PI;
  return (degFromRight + 90 + 360) % 360;
}

export default function ClockTimeGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const levelSpec = LEVELS[levelIndex];
  // --- UPDATE: This state now controls the switch ---
  const [phase, setPhase] = useState<'hour' | 'minute'>('hour');

  const [target, setTarget] = useState({ hours: 4, minutes: 0 });
  const [userTime, setUserTime] = useState({ hours: 12, minutes: 0 });

  const hourAnim = useRef(new Animated.Value(0)).current;
  const minuteAnim = useRef(new Animated.Value(0)).current;

  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [highlightHour, setHighlightHour] = useState(false);
  const [highlightMinute, setHighlightMinute] = useState(false);

  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;

  const managerRef = useRef(new GameFlowManager()).current;
  const minutePan = useRef({ dragging: false }).current;
  const hourPan = useRef({ dragging: false }).current;

  const clockWrapRef = useRef<View>(null);
  const clockOffsetY = useRef(0);
  const clockOffsetX = useRef(0);
  
  useEffect(() => {
    startNewProblem();
  }, [levelIndex]);

  useEffect(() => {
    const { hourAngle, minuteAngle } = angleForTime(userTime.hours, userTime.minutes);
    if (!hourPan.dragging) {
      Animated.timing(hourAnim, { toValue: hourAngle, duration: 200, useNativeDriver: false }).start();
    }
    if (!minutePan.dragging) {
      Animated.timing(minuteAnim, { toValue: minuteAngle, duration: 200, useNativeDriver: false }).start();
    }
  }, [userTime]);

  function startNewProblem() {
    const hour = Math.floor(Math.random() * 12) + 1;
    let minute = 0;

    if (levelSpec.minuteOptions === 'hourOnly') {
      minute = 0;
    } else if (levelSpec.minuteOptions === 'all') {
      minute = Math.floor(Math.random() * 12) * 5;
    } else if (Array.isArray(levelSpec.minuteOptions)) {
      minute = levelSpec.minuteOptions[Math.floor(Math.random() * levelSpec.minuteOptions.length)];
    }

    setTarget({ hours: hour, minutes: minute });
    setUserTime({ hours: 12, minutes: 0 });
    managerRef.resetLevel();
    setCurrentHintLevel(0);
    setHighlightHour(false);
    setHighlightMinute(false);
    // --- UPDATE: Always start by setting the hour hand ---
    setPhase('hour');
  }

  function checkAnswer() {
    const isCorrect = userTime.hours === target.hours && userTime.minutes === target.minutes;
    managerRef.recordAttempt(isCorrect);
    if (isCorrect) {
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
          if (managerRef.status !== 'dependent' && levelIndex < LEVELS.length - 1) {
            setLevelIndex(levelIndex + 1);
          } else {
            startNewProblem();
          }
        });
      }, 1500);
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

  function showHint() {
    const newLevel = Math.min(3, currentHintLevel + 1);
    setCurrentHintLevel(newLevel);
    managerRef.updateHints();
    managerRef.hintLevel = newLevel;

    if (newLevel === 1) {
      setHighlightHour(true);
    } else if (newLevel === 2) {
      setHighlightHour(true);
      setHighlightMinute(true);
    } else if (newLevel === 3) {
      setHighlightHour(true);
      setHighlightMinute(true);
      setUserTime({ hours: target.hours, minutes: target.minutes });
    }
  }
  
  function playSolutionAnimation() {
      managerRef.hintLevel = 3;
      managerRef.status = 'dependent';
      setUserTime({ hours: target.hours, minutes: target.minutes });
      setTimeout(() => {
        startNewProblem();
      }, 1500);
  }

  const minuteResponder = useRef(
    PanResponder.create({
      // --- UPDATE: Only respond if the minute phase is active ---
      onStartShouldSetPanResponder: () => phase === 'minute' && levelSpec.minuteOptions !== 'hourOnly',
      onPanResponderGrant: () => { minutePan.dragging = true; },
      onPanResponderMove: (_, g) => {
        if (levelSpec.minuteOptions === 'hourOnly') return;
        const x = g.moveX - clockOffsetX.current;
        const y = g.moveY - clockOffsetY.current;
        const rawAngle = polarToAngle(x, y);
        const minutes = Math.round((rawAngle / 360) * 60) % 60;
        minuteAnim.setValue(rawAngle);
        setUserTime(prev => ({ ...prev, minutes: snapMinuteToStep(minutes, 5) }));
      },
      onPanResponderRelease: () => { minutePan.dragging = false; },
    })
  ).current;

  const hourResponder = useRef(
    PanResponder.create({
      // --- UPDATE: Only respond if the hour phase is active ---
      onStartShouldSetPanResponder: () => phase === 'hour',
      onPanResponderGrant: () => { hourPan.dragging = true; },
      onPanResponderMove: (_, g) => {
        const x = g.moveX - clockOffsetX.current;
        const y = g.moveY - clockOffsetY.current;
        const rawAngle = polarToAngle(x, y);
        const hourFloat = ((rawAngle / 360) * 12);
        let hour = Math.floor(hourFloat === 0 ? 12 : hourFloat);
        if (hour === 0) hour = 12;
        hourAnim.setValue(rawAngle);
        setUserTime(prev => ({ ...prev, hours: hour }));
      },
      // --- UPDATE: Removed the automatic phase switch ---
      onPanResponderRelease: () => { hourPan.dragging = false; },
    })
  ).current;

  const hourRotate = hourAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const minuteRotate = minuteAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Image source={ASSETS.background} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <Text style={styles.levelTitle}>
          Telling Time — Level {levelSpec.id}: {levelSpec.name}
        </Text>
        <Text style={styles.question}>
          Set the clock to {target.hours}:{target.minutes.toString().padStart(2, '0')}
        </Text>
      </View>

      <View
        ref={clockWrapRef}
        style={styles.clockWrap}
        onLayout={() => {
            clockWrapRef.current?.measure((x, y, width, height, pageX, pageY) => {
                if(pageY) {
                    clockOffsetY.current = pageY;
                    clockOffsetX.current = pageX;
                }
            });
        }}
      >
        <Image source={ASSETS.clockFace} style={{ width: CLOCK_SIZE, height: CLOCK_SIZE, position: 'absolute' }} />
        <Animated.View style={[styles.handWrap, { transform: [{ rotate: minuteRotate }] }]} {...minuteResponder.panHandlers}>
          <Image source={ASSETS.minuteHand} style={[styles.minuteHand, highlightMinute && styles.highlight]} />
        </Animated.View>
        <Animated.View style={[styles.handWrap, { transform: [{ rotate: hourRotate }] }]} {...hourResponder.panHandlers}>
          <Image source={ASSETS.hourHand} style={[styles.hourHand, highlightHour && styles.highlight]} />
        </Animated.View>
      </View>
      
      {/* --- UPDATE: Added the switch UI below the clock --- */}
      <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={[styles.switchButton, phase === 'hour' && styles.switchButtonActive]}
            onPress={() => setPhase('hour')}
          >
              <Text style={[styles.switchButtonText, phase === 'hour' && styles.switchButtonTextActive]}>Set Hour Hand</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={levelSpec.minuteOptions === 'hourOnly'}
            style={[
                styles.switchButton, 
                phase === 'minute' && styles.switchButtonActive,
                levelSpec.minuteOptions === 'hourOnly' && styles.switchButtonDisabled
            ]}
            onPress={() => setPhase('minute')}
          >
              <Text style={[styles.switchButtonText, phase === 'minute' && styles.switchButtonTextActive]}>Set Minute Hand</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={startNewProblem}><Image source={ASSETS.reset} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={showHint}><Image source={ASSETS.hint} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={playSolutionAnimation}><Image source={ASSETS.solution} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={checkAnswer}><Image source={ASSETS.submit} style={styles.icon} /></TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Use space-between to push header and buttons to edges
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
  },
  levelTitle: {
    color: '#fbff00ff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
  },
  clockWrap: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handWrap: {
    position: 'absolute',
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  hourHand: {
    width: CLOCK_SIZE * 0.22,
    height: CLOCK_SIZE * 0.35,
    resizeMode: 'contain',
    marginTop: CLOCK_SIZE * 0.15
  },
  minuteHand: {
    width: CLOCK_SIZE * 0.16,
    height: CLOCK_SIZE * 0.45,
    resizeMode: 'contain',
    marginTop: CLOCK_SIZE * 0.05
  },
  highlight: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  // --- UPDATE: New styles for the switch buttons ---
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 25,
    padding: 4,
  },
  switchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  switchButtonActive: {
    backgroundColor: '#fbff00ff',
  },
  switchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  switchButtonTextActive: {
    color: 'black',
  },
  switchButtonDisabled: {
    backgroundColor: 'rgba(100,100,100,0.5)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  icon: { width: 50, height: 50 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayImage: { width: width * 0.7, height: width * 0.7, resizeMode: 'contain' },
});