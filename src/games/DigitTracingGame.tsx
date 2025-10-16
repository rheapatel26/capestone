
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View,Image, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder, ImageBackground,Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as pathUtils from 'svg-path-properties';
import { Image as ExpoImage } from 'expo-image';
const screenWidth = Dimensions.get('window').width;
const canvasWidth = screenWidth - 40;

const digitPaths: { [key: string]: string } = {
  0: "M200 80 Q240 80 240 120 L240 180 Q240 220 200 220 Q160 220 160 180 L160 120 Q160 80 200 80",
  1: "M180 80 L200 80 L200 220 L180 220",
  2: "M150 80 L250 80 Q280 80 280 110 L280 140 L150 200 L150 230 L280 230",
  3: "M150 80 L250 80 Q280 80 280 110 Q280 130 250 130 Q280 130 280 160 Q280 190 250 190 L150 190",
  4: "M150 80 L150 150 L250 150 L200 80 L200 220",
  5: "M280 80 L150 80 L150 150 L250 150 Q280 150 280 180 Q280 220 250 220 L150 220",
  6: "M250 80 L150 80 L150 220 Q150 250 180 250 Q250 250 250 190 Q250 150 180 150 L150 150",
  7: "M150 80 L280 80 L200 220",
  8: "M200 80 Q160 80 160 110 Q160 130 200 130 Q240 130 240 110 Q240 80 200 80 Q240 80 240 110 Q240 130 200 130 Q160 130 160 160 Q160 190 200 190 Q240 190 240 160 Q240 130 200 130",
  9: "M150 220 L250 220 L250 80 Q250 50 220 50 Q150 50 150 110 Q150 150 220 150 L250 150"
};

const getDigitPath = (digit: number) => {
  const path = digitPaths[digit.toString()];
  const properties = new pathUtils.svgPathProperties(path);
  const totalLength = properties.getTotalLength();
  return { path, properties, totalLength };
};

const ASSETS = {

    background: require('../../assets/digitTrace/Digit_Tracing_bg.png'),

    pacman: require('../../assets/digitTrace/1.png'),

    apple: require('../../assets/digitTrace/apple.png'),
    reset: require('../../assets/icons/icon_reset.png'),
    // hint: require('../../assets/ui/hint2.png'),
    // solution: require('../../assets/ui/solution.png'),
    submit: require('../../assets/ui/icon_submit.png'),
    celebrate: require('../../assets/ui/Confetti.gif'),
    incorrect: require('../../assets/ui/icon_wrong.gif'),

};

export default function DigitTracingGameFreeform() {
  const [level, setLevel] = useState(0);
  const [userPath, setUserPath] = useState('');
  const [tracedPoints, setTracedPoints] = useState<Array<{ x: number, y: number }>>([]);

  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const incorrectAnim = useRef(new Animated.Value(0)).current;

  const { path, properties, totalLength } = useMemo(() => getDigitPath(level), [level]);
  
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        setTracedPoints(prev => [...prev, { x, y }]);
        setUserPath(prev => prev ? prev + ` L ${x} ${y}` : `M ${x} ${y}`);
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const checkIfPathValid = () => {
    const tolerance = 25;
    let matchedPoints = 0;
    tracedPoints.forEach(pt => {
      for (let i = 0; i < totalLength; i += 5) {
        const curvePt = properties.getPointAtLength(i);
        if (Math.hypot(curvePt.x - pt.x, curvePt.y - pt.y) < tolerance) {
          matchedPoints++;
          break;
        }
      }
    });
    const ratio = matchedPoints / tracedPoints.length;
    return ratio > 0.85;
  };

  const onSubmit = () => {
    const isCorrect = checkIfPathValid();
    if (isCorrect) {
      // alert("Correct! Moving to next digit.");
      //play animation
      triggerCelebrate();
      setLevel(prev => (prev < 9 ? prev + 1 : 0));
      reset();
    } else {
      // alert("Try again!");
      triggerIncorrect();
    }
  };

  const reset = () => {
    setUserPath('');
    setTracedPoints([]);
  };

  return (
    <ImageBackground
      source={ASSETS.background}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.levelText}>Digit: {level}</Text>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          <Path d={path} stroke="#cccccc" strokeWidth={4} fill="none" />
          <Path d={userPath} stroke="orange" strokeWidth={6} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={reset}>
          {/* <Text style={styles.buttonText}>Reset</Text> */}
          <Image source={ASSETS.reset} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          {/* <Text style={styles.buttonText}>Submit</Text> */}
          <Image source={ASSETS.submit} style={styles.icon} />
        </TouchableOpacity>
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

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 180,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  canvas: {
    width: canvasWidth,
    height: canvasWidth * 1.2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 10,
    marginVertical: 20,
  },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', position: 'absolute', bottom: 20, borderRadius: 5, padding:50 },
  icon: { width: 50, height: 50, marginHorizontal: 16 },
  
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 25,
    fontFamily: 'PixelFont',
    color: '#0000',
    marginTop: 10,
  },
  overlay: { position: 'absolute', top: '40%', left: '35%', zIndex: 10 },
  overlayImage: { width: 150, height: 150, resizeMode: 'contain' },
});