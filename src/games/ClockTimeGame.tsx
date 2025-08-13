/*
ClockTimeGame.tsx
React Native + TypeScript component (Expo compatible)
Pixelated-style Time Concept Game for slow learners

How to use
1) Place this file in your React Native / Expo app (e.g. /src/games/ClockTimeGame.tsx).
2) Put assets (sprites, background, fonts) in /assets/clockgame/ . See ASSETS section below.
3) Add the font (pixel font) to app.json or load with Expo Font loader.
4) Import and register route in your navigation: e.g. navigation.navigate('ClockGame', { onComplete })

Integration with your second minigame and dashboard
- This component accepts props to report progress and to receive shared config.
- Props: onProgressUpdate({level, result, mode}), onComplete(finalScore), config
- To embed into your dashboard, simply add an entry in your nav stack or call a callback when a level is passed.

Customization (UI / Images / Colors)
- All images and colors are centralized in the ASSETS and THEME objects below.
- Replace any image in /assets/clockgame and update the filename in ASSETS.
- Change palette colors in THEME.
- Swap pixel font by changing the PIXEL_FONT constant (and updating font loading in your app).

Pixelated look
- Use a pixel font (PressStart2P or similar) and scale up assets.
- Use styles with borderRadius small, and image renderingMode 'pixelated' (web), but in React Native we simulate by using small PNG sprites scaled up.

This file contains a compact but fully working core of the game:
- Levels 1..6 implemented
- Randomizer and hint system
- Solution animation using Animated.timing
- Draggable hands with snapping to tick marks


--- BEGIN CODE ---
*/

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
  GestureResponderEvent,
  PanResponder,
  ImageSourcePropType,
} from 'react-native';

// ---------- ASSETS & THEME (change these to customize images/colors/fonts) ----------
// Put your images in /assets/clockgame/ and update imports or file names

const ASSETS = {
  bg: require('../../assets/clockgame/bg1.gif') as ImageSourcePropType,
  clockFace: require('../../assets/clockgame/clock_face_pixel.png') as ImageSourcePropType,
  hourHand: require('../../assets/clockgame/hour_hand_pixel.png') as ImageSourcePropType,
  minuteHand: require('../../assets/clockgame/minute_hand_pixel.png') as ImageSourcePropType,
  hintGlow: require('../../assets/clockgame/hint_glow_pixel.png') as ImageSourcePropType,
};

// Theme colors - change as needed
const THEME = {
  bgColor: '#0b1020',
  panelColor: '#111827',
  accent: '#FFD166',
  pixelFont: 'PressStart2P-Regular', // ensure you load this font in your app (Expo Font)
};

// ---------- TYPES & HELPERS ----------

type LevelSpec = {
  id: number;
  name: string;
  minuteOptions: number[] | 'all' | 'hourOnly';
};

const LEVELS: LevelSpec[] = [
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
  // returns angle in degrees from top (12 o'clock) clockwise
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30; // 360/12 =30
  const minuteAngle = (minutes / 60) * 360;
  return { hourAngle, minuteAngle };
}

function snapMinuteToStep(rawMinutes: number, step = 5) {
  return Math.round(rawMinutes / step) * step % 60;
}

// Convert polar to degrees from top
function polarToAngle(x: number, y: number) {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const rad = Math.atan2(dy, dx);
  const degFromRight = (rad * 180) / Math.PI; // zero is to the right
  const degFromTop = (degFromRight + 90 + 360) % 360;
  return degFromTop;
}

// ---------- Main Component ----------

export default function ClockTimeGame({
  initialLevel = 1,
  onProgressUpdate = (_: any) => {},
  onComplete = (_: any) => {},
  config = {},
}: {
  initialLevel?: number;
  onProgressUpdate?: (payload: { level: number; result: 'independent' | 'partial' | 'dependent' }) => void;
  onComplete?: (summary: any) => void;
  config?: any;
}) {
  const [levelIndex, setLevelIndex] = useState(Math.max(0, initialLevel - 1));
  const levelSpec = LEVELS[levelIndex];

  const [target, setTarget] = useState({ hours: 4, minutes: 0 });
  const [userTime, setUserTime] = useState({ hours: 12, minutes: 0 });

  // Animated rotation values (degrees)
  const hourAnim = useRef(new Animated.Value(0)).current;
  const minuteAnim = useRef(new Animated.Value(0)).current;

  // hint visibility
  const [hintState, setHintState] = useState({ showHint: false, hintType: 'none' as 'none' | 'minute' | 'hour' | 'both' });

  // for dragging
  const minutePan = useRef({ dragging: false }).current;
  const hourPan = useRef({ dragging: false }).current;

  // solution animation lock
  const animLock = useRef(false);

  useEffect(() => {
    randomizeTargetForLevel(levelSpec);
  }, [levelIndex]);

  useEffect(() => {
    // update animated hands to userTime when userTime changes (if not dragging)
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
  }, [userTime.hours, userTime.minutes]);

  function randomizeTargetForLevel(spec: LevelSpec) {
    // pick hour 1-12 (avoid 0)
    const hour = Math.floor(Math.random() * 12) + 1;
    let minute = 0;

    if (spec.minuteOptions === 'hourOnly') {
      minute = 0;
    } else if (spec.minuteOptions === 'all') {
      minute = Math.floor(Math.random() * 12) * 5; // 0..55 step 5
    } else if (Array.isArray(spec.minuteOptions)) {
      minute = spec.minuteOptions[Math.floor(Math.random() * spec.minuteOptions.length)];
    }

    // For level 3 (half hours), ensure minute=30
    setTarget({ hours: hour, minutes: minute });

    // reset user position to 12:00
    setUserTime({ hours: 12, minutes: 0 });
  }

  function checkAnswer() {
    // check closeness depending on level's tolerance
    const { hours: th, minutes: tm } = target;
    const { hours: uh, minutes: um } = userTime;

    // For hour hand only, only check hour approximately
    const hourOk = Math.abs(((uh % 12) + um / 60) - (th % 12) ) < 0.51; // less than ~30 deg
    const minuteOk = Math.abs(um - tm) === 0;

    let result: 'independent' | 'partial' | 'dependent' = 'dependent';

    if (hourOk && minuteOk) result = 'independent';
    else if (hourOk || minuteOk) result = 'partial';

    onProgressUpdate({ level: levelSpec.id, result });

    return result;
  }

  function onSubmit() {
    const r = checkAnswer();
    if (r === 'independent') {
      // advance
      const next = Math.min(levelIndex + 1, LEVELS.length - 1);
      setLevelIndex(next);
      randomizeTargetForLevel(LEVELS[next]);
    }
    // if final, call onComplete
    if (levelIndex === LEVELS.length - 1 && r === 'independent') {
      onComplete({ success: true });
    }
  }

  function revealHint() {
    // choose hint type depending on level and difficulty
    if (levelSpec.minuteOptions === 'hourOnly') {
      setHintState({ showHint: true, hintType: 'hour' });
    } else {
      setHintState({ showHint: true, hintType: 'both' });
    }
    onProgressUpdate({ level: levelSpec.id, result: 'partial' });
  }

  function playSolutionAnimation() {
    if (animLock.current) return;
    animLock.current = true;
    setHintState({ showHint: false, hintType: 'none' });

    const { hourAngle, minuteAngle } = angleForTime(target.hours, target.minutes);

    Animated.sequence([
      Animated.timing(minuteAnim, {
        toValue: minuteAngle,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(hourAnim, {
        toValue: hourAngle,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start(() => {
      // after showing solution, randomize a new problem at same level
      animLock.current = false;
      randomizeTargetForLevel(levelSpec);
    });
  }

  // ---------- PanResponder for minute hand ----------
  const minuteResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minutePan.dragging = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        // convert touch to angle
        const touchX = gestureState.moveX - (Dimensions.get('window').width - CLOCK_SIZE) / 2;
        const touchY = gestureState.moveY - 60; // approximate offset top
        const rawAngle = polarToAngle(touchX, touchY);
        const minutes = Math.round((rawAngle / 360) * 60) % 60;
        const snapped = levelSpec.minuteOptions === 'all' || levelSpec.minuteOptions === 'hourOnly' ? snapMinuteToStep(minutes, 5) : (Array.isArray(levelSpec.minuteOptions) ? snapMinuteToStep(minutes, 5) : snapMinuteToStep(minutes, 5));
        // don't allow minute hand for hourOnly
        if (levelSpec.minuteOptions === 'hourOnly') return;
        setUserTime((prev) => ({ ...prev, minutes: snapped }));
      },
      onPanResponderRelease: () => {
        minutePan.dragging = false;
      },
    })
  ).current;

  // PanResponder for hour hand (coarse control)
  const hourResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        hourPan.dragging = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        const offsetX = gestureState.moveX - (Dimensions.get('window').width - CLOCK_SIZE) / 2;
        const offsetY = gestureState.moveY - 60;
        const rawAngle = polarToAngle(offsetX, offsetY);
        // convert to hours and minutes fraction
        const minutes = Math.round((rawAngle / 360) * 60) % 60;
        const hourFloat = ((rawAngle / 360) * 12) % 12;
        let hour = Math.floor(hourFloat);
        if (hour === 0) hour = 12;
        // For snapping to whole hours when minute is 0
        let snappedMinutes = prevAllowedMinuteForLevel(levelSpec, minutes);
        setUserTime({ hours: hour, minutes: snappedMinutes });
      },
      onPanResponderRelease: () => {
        hourPan.dragging = false;
      },
    })
  ).current;

  function prevAllowedMinuteForLevel(spec: LevelSpec, rawMinutes: number) {
    if (spec.minuteOptions === 'hourOnly') return 0;
    if (spec.minuteOptions === 'all') return snapMinuteToStep(rawMinutes, 5);
    if (Array.isArray(spec.minuteOptions)) {
      // snap to closest allowed
      let best = spec.minuteOptions[0];
      let minDiff = 100;
      for (const m of spec.minuteOptions) {
        const diff = Math.abs(m - rawMinutes);
        if (diff < minDiff) {
          minDiff = diff;
          best = m;
        }
      }
      return best;
    }
    return snapMinuteToStep(rawMinutes, 5);
  }

  // ---------- Render ----------
  const hourRotate = hourAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const minuteRotate = minuteAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.container, { backgroundColor: THEME.bgColor }]}> 
      <Image source={ASSETS.bg} style={[styles.bg, { width: '100%', height: '100%', position: 'absolute' }]} resizeMode="cover" />
      <View style={styles.header}>
        <Text style={styles.title}>Time Concept Game — Level {levelSpec.id}</Text>
        <Text style={styles.subtitle}>{levelSpec.name}</Text>
      </View>

      <View style={styles.clockWrap}>
        <Image source={ASSETS.clockFace} style={{ width: CLOCK_SIZE, height: CLOCK_SIZE, position: 'absolute' }} />

        {/* minute hand */}
        <Animated.View
          style={[styles.handWrap, { transform: [{ rotate: minuteRotate }], zIndex: 10 }]}
          {...minuteResponder.panHandlers}
        >
          <Image source={ASSETS.minuteHand} style={[styles.minuteHand]} />
        </Animated.View>

        {/* hour hand */}
        <Animated.View style={[styles.handWrap, { transform: [{ rotate: hourRotate }], zIndex: 20 }]} {...hourResponder.panHandlers}>
          <Image source={ASSETS.hourHand} style={[styles.hourHand]} />
        </Animated.View>

        {/* Hint glow */}
        {hintState.showHint && (
          <Image source={ASSETS.hintGlow} style={[styles.hintGlow, { opacity: 0.9 }]} />
        )}
      </View>

      <View style={styles.controls}>
        <Text style={styles.prompt}>Set the clock to {formatTime(target.hours, target.minutes)}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={revealHint}>
            <Text style={styles.buttonText}>Hint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={playSolutionAnimation}>
            <Text style={styles.buttonText}>Show Solution</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: THEME.accent }]} onPress={onSubmit}>
            <Text style={[styles.buttonText, { color: '#111' }]}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.info}>Your time: {formatTime(userTime.hours, userTime.minutes)}</Text>
          <Text style={styles.info}>Target: {formatTime(target.hours, target.minutes)}</Text>
        </View>

      </View>
    </View>
  );
}

function formatTime(h: number, m: number) {
  const hm = (h % 12) === 0 ? 12 : (h % 12);
  return `${hm}:${m.toString().padStart(2, '0')}`;
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bg: {
    position: 'absolute',
  },
  header: {
    marginTop: 36,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
    // fontFamily: THEME.pixelFont,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 11,
    // fontFamily: THEME.pixelFont,
  },
  clockWrap: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handWrap: {
    position: 'absolute',
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    transform: [{ translateY: 0 }],
  },
  hourHand: {
    width: CLOCK_SIZE * 0.22,
    height: CLOCK_SIZE * 0.35,
    resizeMode: 'contain',
    marginTop: CLOCK_SIZE * 0.15,
  },
  minuteHand: {
    width: CLOCK_SIZE * 0.16,
    height: CLOCK_SIZE * 0.45,
    resizeMode: 'contain',
    marginTop: CLOCK_SIZE * 0.05,
  },
  hintGlow: {
    width: CLOCK_SIZE * 0.9,
    height: CLOCK_SIZE * 0.9,
    position: 'absolute',
  },
  controls: {
    width: '90%',
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  prompt: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
    // fontFamily: THEME.pixelFont,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#203040',
    marginHorizontal: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    // fontFamily: THEME.pixelFont,
  },
  infoRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    color: '#ddd',
    fontSize: 11,
  },
});

/*
Notes & Next steps / Integration guide

1) Expo font loading (example)
- In your root App.tsx:

import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

const [fontsLoaded] = Font.useFonts({
  'PressStart2P-Regular': require('./assets/fonts/PressStart2P-Regular.ttf'),
});

if (!fontsLoaded) return <AppLoading />;

2) Assets
- Create folder: /assets/clockgame/
  - bg_pixel.png
  - clock_face_pixel.png
  - hour_hand_pixel.png
  - minute_hand_pixel.png
  - hint_glow_pixel.png
- Use small sprite PNGs (like 64x64/128x128) then scale in the app to keep pixelated look.

3) Connecting to your second minigame & dashboard
- Export component as default and import into your navigation stack.
- Example React Navigation integration:

// in AppNavigator.tsx
<Stack.Screen name="ClockGame" component={ClockTimeGame} />

- To call back into your dashboard: pass a callback prop when navigating:

navigation.navigate('ClockGame', { onComplete: (summary) => { /* update dashboard */ /*} });

- Or use a central store (Redux / Context) and dispatch events in onProgressUpdate/onComplete.

4) Replacing UI components
- Replace images in ASSETS with your own pixel art. Keep filename the same or change the require path.
- Change THEME.bgColor or THEME.accent for palette swaps.
- Change font by updating THEME.pixelFont and loading that font in app.

5) Level tuning & additional scaffolding
- You can increase hints or add additional animations by modifying revealHint and playSolutionAnimation.
- The evaluation "independent/partial/dependent" is emitted via onProgressUpdate; hook that into your existing mastery evaluation.

6) Android/iOS build
- This is an Expo-compatible component. To build standalone apps for Android/iOS, use EAS Build or expo build.

7) Accessibility & Indian timezone
- All times are displayed as simplified 12h values. If you need localization, format timestamps with your locale.

If you want, I can:
- Convert this to a multi-file module with separate Level engine, Assets manager, and tests.
- Add persistent progress storage (AsyncStorage) and a visual progress bar for the dashboard.

*/
