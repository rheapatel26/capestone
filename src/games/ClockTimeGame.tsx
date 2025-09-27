import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GameFlowManager } from '../utils/GameFlowManager';

// ---------- ASSETS ----------
const ASSETS = {
  background: require('../../assets/clockgame/clockgame_bg.png'),
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
const CLOCK_SIZE = Math.min(width, 420) * 0.85;
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

  const [target, setTarget] = useState({ hours: 4, minutes: 0 });
  const [userTime, setUserTime] = useState({ hours: 12, minutes: 0 });

  const hourAnim = useRef(new Animated.Value(0)).current;
  const minuteAnim = useRef(new Animated.Value(0)).current;

  const [highlightHour, setHighlightHour] = useState(false);
  const [highlightMinute, setHighlightMinute] = useState(false);

  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const managerRef = useRef(new GameFlowManager()).current;
  const minutePan = useRef({ dragging: false }).current;
  const hourPan = useRef({ dragging: false }).current;

  useEffect(() => {
    startNewProblem();
  }, [levelIndex]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
    setHighlightHour(false);
    setHighlightMinute(false);
    managerRef.resetLevel();
  }

  function checkAnswer() {
    const correct = target.hours === userTime.hours && target.minutes === userTime.minutes;
    managerRef.recordAttempt(correct);
    if (correct) triggerCelebrate();
    else triggerIncorrect();
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
    if (managerRef.hintLevel === 1) setHighlightHour(true);
    else if (managerRef.hintLevel === 2) {
      setHighlightHour(true);
      setHighlightMinute(true);
    } else if (managerRef.hintLevel === 3) {
      setHighlightHour(true);
      setHighlightMinute(true);
      setUserTime({ hours: target.hours, minutes: target.minutes });
    }
  }

  function playSolutionAnimation() {
    managerRef.hintLevel = 3;
    managerRef.status = 'dependent';
    const { hourAngle, minuteAngle } = angleForTime(target.hours, target.minutes);
    Animated.parallel([
      Animated.timing(minuteAnim, { toValue: minuteAngle, duration: 700, useNativeDriver: false }),
      Animated.timing(hourAnim, { toValue: hourAngle, duration: 700, useNativeDriver: false }),
    ]).start();
  }

  // Minute Hand Drag
  const minuteResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { minutePan.dragging = true; },
      onPanResponderMove: (_, g) => {
        if (levelSpec.minuteOptions === 'hourOnly') return;
        const x = g.moveX - (Dimensions.get('window').width - CLOCK_SIZE) / 2;
        const y = g.moveY - 60;
        const rawAngle = polarToAngle(x, y);
        const minutes = Math.round((rawAngle / 360) * 60) % 60;
        setUserTime(prev => ({ ...prev, minutes: snapMinuteToStep(minutes, 5) }));
      },
      onPanResponderRelease: () => { minutePan.dragging = false; },
    })
  ).current;

  // Hour Hand Drag
  const hourResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { hourPan.dragging = true; },
      onPanResponderMove: (_, g) => {
        const x = g.moveX - (Dimensions.get('window').width - CLOCK_SIZE) / 2;
        const y = g.moveY - 60;
        const rawAngle = polarToAngle(x, y);
        const hourFloat = ((rawAngle / 360) * 12) % 12;
        let hour = Math.floor(hourFloat) || 12;
        setUserTime(prev => ({ ...prev, hours: hour }));
      },
      onPanResponderRelease: () => { hourPan.dragging = false; },
    })
  ).current;

  const hourRotate = hourAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const minuteRotate = minuteAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Image
        source={ASSETS.background}
        style={[
          StyleSheet.absoluteFillObject,
          { width: '100%', height: '100%', resizeMode: 'stretch' }
        ]}
      />
      <Text style={styles.question}>Set the clock to {target.hours}:{target.minutes.toString().padStart(2, '0')}</Text>

      <View style={styles.clockWrap}>
        <Image source={ASSETS.clockFace} style={{ width: CLOCK_SIZE, height: CLOCK_SIZE, position: 'absolute' }} />

        <Animated.View style={[styles.handWrap, { transform: [{ rotate: minuteRotate }] }]} {...minuteResponder.panHandlers}>
          <Image source={ASSETS.minuteHand} style={styles.minuteHand} />
        </Animated.View>

        <Animated.View style={[styles.handWrap, { transform: [{ rotate: hourRotate }] }]} {...hourResponder.panHandlers}>
          <Image source={ASSETS.hourHand} style={styles.hourHand} />
        </Animated.View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={startNewProblem}><Image source={ASSETS.reset} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={showHint}><Image source={ASSETS.hint} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={playSolutionAnimation}><Image source={ASSETS.solution} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={checkAnswer}><Image source={ASSETS.submit} style={styles.icon} /></TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  question: {
    fontSize: 22,
    color: 'darkblue',
    lineHeight: 40,
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginTop: 180,
  },
  clockWrap: { width: CLOCK_SIZE, height: CLOCK_SIZE, marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  handWrap: { position: 'absolute', width: CLOCK_SIZE, height: CLOCK_SIZE, alignItems: 'center', justifyContent: 'flex-start' },
  hourHand: { width: CLOCK_SIZE * 0.22, height: CLOCK_SIZE * 0.35, resizeMode: 'contain', marginTop: CLOCK_SIZE * 0.15 },
  minuteHand: { width: CLOCK_SIZE * 0.16, height: CLOCK_SIZE * 0.45, resizeMode: 'contain', marginTop: CLOCK_SIZE * 0.05 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', position: 'absolute', bottom: 0, backgroundColor: 'rgba(246, 203, 85, 0.8)', borderRadius: 5, padding:14 },
  icon: { width: 50, height: 50 },
  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 150, height: 150, resizeMode: 'contain' },
});
