
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
const { width } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width, 420) * 0.85;
const CENTER = CLOCK_SIZE / 2.1;

const ASSETS = {
  bg: require('../../assets/clockgame/clockgame_bg.png'),
  clockFace: require('../../assets/clockgame/clock_face_pixel.png'),
  reset: require('../../assets/icons/icon_reset.png'),
  hint: require('../../assets/ui/hint2.png'),
  solution: require('../../assets/ui/solution.png'),
  submit: require('../../assets/ui/icon_submit.png'),
  celebrate: require('../../assets/ui/Confetti.gif'),
  incorrect: require('../../assets/ui/icon_wrong.gif'),
};

const LEVELS = [
  { id: 1, name: 'Hour Hand Only', minuteOptions: 'hourOnly' },
  { id: 2, name: 'Whole Hours', minuteOptions: [0] },
  { id: 3, name: 'Half Hours', minuteOptions: [30] },
  { id: 4, name: 'Quarter Hours', minuteOptions: [0, 15, 30, 45] },
  { id: 5, name: 'infinite', minuteOptions: [0, 15, 30, 45] },
  { id: 6, name: 'infinite', minuteOptions: [0, 15, 30, 45] },
];

function angleForTime(hours: number, minutes: number) {
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
  const minuteAngle = (minutes / 60) * 360;
  return { hourAngle, minuteAngle };
}

function polarToAngle(x: number, y: number) {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const rad = Math.atan2(dy, dx);
  const degFromRight = (rad * 180) / Math.PI;
  const degFromTop = (degFromRight + 90 + 360) % 360;
  return degFromTop;
}

export default function ClockTimeGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const levelSpec = LEVELS[levelIndex];
  const [target, setTarget] = useState({ hours: 3, minutes: 0 });
  const [userTime, setUserTime] = useState({ hours: 12, minutes: 0 });

  const hourAnim = useRef(new Animated.Value(0)).current;
  const minuteAnim = useRef(new Animated.Value(0)).current;

  const hourPan = useRef({ dragging: false }).current;
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hintVisible, setHintVisible] = useState(false);
  const managerRef = useRef(new GameFlowManager()).current;
  const minutePan = useRef({ dragging: false }).current;
  // --- Clock Hand Control ---
  const [activeHand, setActiveHand] = useState<'hour' | 'minute'>('hour'); // default to hour hand


  useEffect(() => {
    randomizeTarget();
  }, [levelIndex]);

  useEffect(() => {
    const { hourAngle, minuteAngle } = angleForTime(userTime.hours, userTime.minutes);
    if (!hourPan.dragging) {
      Animated.timing(hourAnim, {
        toValue: hourAngle,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
    if (!minutePan.dragging) {
      Animated.timing(minuteAnim, {
        toValue: minuteAngle,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  }, [userTime]);

  const randomizeTarget = () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    let minute = 0;
    if (levelSpec.minuteOptions === 'hourOnly') {
      minute = 0;
    } else if (levelSpec.minuteOptions === 'all') {
      minute = Math.floor(Math.random() * 60);
    } else if (Array.isArray(levelSpec.minuteOptions)) {
      minute = levelSpec.minuteOptions[Math.floor(Math.random() * levelSpec.minuteOptions.length)];
    }
    setTarget({ hours: hour, minutes: minute });
    setUserTime({ hours: 12, minutes: 0 });
  };
  function triggerCelebrate() {
    setShowCelebrate(true);
    Animated.spring(celebrateAnim, { toValue: 1, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.spring(celebrateAnim, { toValue: 0, useNativeDriver: true }).start(() => {
          setShowCelebrate(false);
          // randomizeTarget();
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

  const showHint = () => {
    // alert(`Hint: Set to ${target.hours}:${target.minutes.toString().padStart(2, '0')}`);
    setHintVisible(true);
    setTimeout(() => setHintVisible(false), 3000); // hide after 3 seconds
    

  };

  const playSolutionAnimation = () => {
    const { hourAngle, minuteAngle } = angleForTime(target.hours, target.minutes);
    Animated.parallel([
      Animated.timing(hourAnim, {
        toValue: hourAngle,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(minuteAnim, {
        toValue: minuteAngle,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start(() => {
      setUserTime({ ...target });
    });
  };

  const checkAnswer = () => {
    const { hours: th, minutes: tm } = target;
    const { hours: uh, minutes: um } = userTime;

    // const hourOk = Math.abs(((uh % 12) + um / 60) - (th % 12)) < 0.51;
    // const minuteOk = Math.abs(um - tm) === 0;

    return target.minutes === userTime.minutes && target.hours === userTime.hours;
  };

  const onSubmit = () => {
    if (checkAnswer()) {
      
      if(levelIndex < LEVELS.length - 1){
        setLevelIndex(levelIndex+1);
      }
      else{
        randomizeTarget();
      }
      triggerCelebrate();
    }
    else{
      triggerIncorrect(); 
    }
    
    managerRef.recordAttempt(checkAnswer());
  };

  // const hourResponder = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onPanResponderMove: (_, gesture) => {
  //       const angle = polarToAngle(gesture.moveX - 24, gesture.moveY - 150);
  //       let hourFloat = ((angle / 360) * 12) % 12;
  //       let hour = Math.round(hourFloat);
  //       if (hour === 0) hour = 12;
  //       setUserTime(prev => ({ ...prev, hours: hour }));
  //     },
  //   })
  // ).current;

  // const minuteResponder = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onPanResponderMove: (_, gesture) => {
  //       const angle = polarToAngle(gesture.moveX - 24, gesture.moveY - 150);
  //       let minute = Math.round((angle / 360) * 60) % 60;
  //       setUserTime(prev => ({ ...prev, minutes: minute }));
  //     },
  //   })
  // ).current;

  const hourRotate = hourAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const minuteRotate = minuteAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Image 
        source={ASSETS.bg} 
        style={[
          StyleSheet.absoluteFillObject,
          { width: '100%', height: '100%', resizeMode: 'stretch' }
        ]}  
      />
      <Text style={styles.levelText}>Level {levelSpec.id}: {levelSpec.name}</Text>

      <Text style={styles.question}>Set the clock to {target.hours}:{target.minutes.toString().padStart(2, '0')}</Text>

      <Text style={styles.userTime}>You set: {userTime.hours}:{userTime.minutes.toString().padStart(2, '0')}</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity onPress={() => setActiveHand('hour')}>
          <Text style={[styles.toggleText, activeHand === 'hour' && styles.activeToggle]}>HOUR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveHand('minute')}>
          <Text style={[styles.toggleText, activeHand === 'minute' && styles.activeToggle]}>MINUTE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clockWrap}>

        {/* <Image source={ASSETS.clockFace} style={styles.clockFace} /> */}
        {/* --- New Clickable Clock Face --- */}
        <View style={styles.clockFace}>
          {[...Array(12)].map((_, i) => {
            const angle = (i + 1) * 30;
            const radius = CLOCK_SIZE * 0.42;
            const x = CENTER + radius * Math.sin((angle * Math.PI) / 180);
            const y = CENTER - radius * Math.cos((angle * Math.PI) / 180);

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.clockNumber,
                  { left: x - 15, top: y - 15 },
                ]}
                onPress={() => {
                  if (activeHand === 'hour') {
                    setUserTime(prev => ({ ...prev, hours: i + 1 }));
                  } else {
                    setUserTime(prev => ({ ...prev, minutes: (i + 1) * 5 % 60 }));
                  }
                }}
              >
                <Text style={styles.clockNumberText}>{i + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        
        {hintVisible && (
          <>
            {/* Glow for minute hand tip */}
            <View style={[
              styles.glowCircle,
              {
                transform: [
                  { rotate: `${angleForTime(0, target.minutes).minuteAngle}deg` },
                  { translateY: -CLOCK_SIZE * 0.4 },
                ],
              }
            ]} />

            {/* Glow for hour hand tip */}
            <View style={[
              styles.glowCircle,
              {
                transform: [
                  { rotate: `${angleForTime(target.hours, target.minutes).hourAngle}deg` },
                  { translateY: -CLOCK_SIZE * 0.25 },
                ],
              }
            ]} />
          </>
        )}

        
        <Animated.View
          style={[styles.hand, styles.minuteHand, { transform: [{ rotate: minuteRotate }] }]}
        />
        <Animated.View
          style={[styles.hand, styles.hourHand, { transform: [{ rotate: hourRotate }] }]}
        />

      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={randomizeTarget}><Image source={ASSETS.reset} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={showHint}><Image source={ASSETS.hint} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={playSolutionAnimation}><Image source={ASSETS.solution} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={onSubmit}><Image source={ASSETS.submit} style={styles.icon} /></TouchableOpacity>
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
    fontSize: 18,
    color: 'darkblue',
    lineHeight: 40,
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginTop: 120,
  },
  clockWrap: { width: CLOCK_SIZE, height: CLOCK_SIZE, justifyContent: 'center', alignItems: 'center' },
  clockFace: { width: CLOCK_SIZE, height: CLOCK_SIZE, position: 'absolute' },
  hand: {
    position: 'absolute',
    transformOrigin: 'bottom',
    bottom: CENTER,
    width: 10,
    borderRadius: 5,
  },
  hourHand: {
    height: CLOCK_SIZE * 0.3,
    backgroundColor: '#FFD700',

  },
  minuteHand: {
    height: CLOCK_SIZE * 0.4,
    backgroundColor: '#00BFFF',

  },
  prompt: { color: '#fff', fontSize: 20, marginTop: 12 },
  userTime: { color: 'darkblue',fontFamily:"PixelFont", fontSize: 14, marginTop: 8 },
  levelText: { color: '#a1dd', fontSize: 16, fontFamily:'PixelFont', marginTop:25 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', position: 'absolute', bottom: 0, backgroundColor: 'rgba(246, 203, 85, 0.8)', borderRadius: 5, padding:14 },
  icon: { width: 50, height: 50, marginHorizontal: 16 },
  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 150, height: 150, resizeMode: 'contain' },

  glowCircle: {
    position: 'absolute',
    top: CENTER,
    left: CENTER - 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 0, 0.6)',
    zIndex: 10,
  },
  toggleRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 10,
  },
  toggleText: {
    fontSize: 18,
    color: 'darkblue',
    fontFamily: 'PixelFont',
    marginHorizontal: 16,
  },
  activeToggle: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  clockNumber: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  clockNumberText: {
    color: 'darkblue',
    fontFamily: 'PixelFont',
    fontSize: 13,
  },


});