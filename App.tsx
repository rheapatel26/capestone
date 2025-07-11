import React, { useRef, useState, useEffect, useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
  Animated,
  ImageBackground,
} from 'react-native';

import Svg, { Path, Circle, Defs, Mask, Rect } from 'react-native-svg';
import * as pathUtils from 'svg-path-properties';
const screenWidth = Dimensions.get('window').width;
const canvasWidth = screenWidth - 40;

const numberPath = "M150 80 L250 80 Q280 80 280 110 L280 140 L150 200 L150 230 L280 230";
const startPoint = { x: 150, y: 80 };
const endPoint = { x: 280, y: 230 };
const allowedOffset = 40; // Increased tolerance for easier tracing

// Generate apple positions along the path
const generateApplePositions = () => {
  const properties = new pathUtils.svgPathProperties(numberPath);
  const totalLength = properties.getTotalLength();
  const appleSpacing = 20; // Distance between apples
  const positions = [];
  
  for (let i = 0; i <= totalLength; i += appleSpacing) {
    const point = properties.getPointAtLength(i);
    positions.push({ x: point.x, y: point.y, id: i });
  }
  
  return positions;
};

export default function App() {
  const [line, setLine] = useState('');
  const [pacmanPos, setPacmanPos] = useState(startPoint);
  const [isCompleted, setIsCompleted] = useState(false);
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [tracedCircles, setTracedCircles] = useState<Array<{x: number, y: number, id: number}>>([]); // New state for traced positions
  const [applePositions] = useState(() => generateApplePositions()); // Generate apple positions once
  const [eatenApples, setEatenApples] = useState<Set<number>>(new Set()); // Track eaten apples

  const pathRef = useRef('');
  const completed = useRef(false);
  const containerRef = useRef<View>(null);
  const isTracingRef = useRef(false); 
  const properties = new pathUtils.svgPathProperties(numberPath);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pacmanImage = useMemo(() => (
  <Image
    source={require('./assets/1.gif')}
    style={styles.pacmanImage}
  />
), []);

  const calculateRotation = (currentPos: { x: number; y: number }, newPos: { x: number; y: number }) => {
    const dx = newPos.x - currentPos.x;
    const dy = newPos.y - currentPos.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  const isNearPath = (x: number, y: number): boolean => {
    const length = properties.getTotalLength();
    for (let i = 0; i <= length; i += 5) {
      const { x: px, y: py } = properties.getPointAtLength(i);
      if (Math.hypot(px - x, py - y) < allowedOffset) return true;
    }
    return false;
  };

  const isNearStartPoint = (x: number, y: number): boolean => {
    return Math.hypot(startPoint.x - x, startPoint.y - y) < allowedOffset;
  };

  const isAtEnd = (x: number, y: number): boolean => {
    return Math.hypot(endPoint.x - x, endPoint.y - y) < allowedOffset;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, gesture) => {
        
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        
        console.log('Touch start at:', x, y);
        console.log('Start point:', startPoint);
        console.log('Near start?', isNearStartPoint(x, y));
        
        // Allow tracing if near start point or already tracing
        if (isNearStartPoint(x, y) || isTracingRef.current) {
          setIsTracing(true);
          isTracingRef.current = true; 
          setIsAnimating(true);
          pathRef.current = `M ${startPoint.x} ${startPoint.y}`;
          console.log('Started tracing!');
        }
      },

      onPanResponderMove: (evt, gesture) => {
        if (!isTracingRef.current) {
          console.log('Not tracing, skipping move');
          return;
        }

        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        
        console.log('Move to:', x, y, 'Near path?', isNearPath(x, y));

        // Pacman moving code, moves even after not on path
        if (isTracingRef.current) {
          if (isNearPath(x, y)) {
            pathRef.current += ` L ${x} ${y}`;
            setLine(pathRef.current);
            
            // Check if Pac-Man is near any apples and "eat" them
            applePositions.forEach(apple => {
              if (Math.hypot(apple.x - x, apple.y - y) < 25) { // Within eating distance
                setEatenApples(prev => new Set([...prev, apple.id]));
              }
            });
            
            // Add circles along the traced path to create mask effect
            setTracedCircles(prev => [
              ...prev,
              { x, y, id: Date.now() + Math.random() }
            ]);
          }

          // Calculate rotation based on movement direction
          const newRotation = calculateRotation(pacmanPos, { x, y });
          Animated.timing(rotationAnim, {
            toValue: newRotation,
            duration: 50,
            useNativeDriver: true,
          }).start();

          setPacmanPos({ x, y });

          if (isAtEnd(x, y) && !completed.current) {
            completed.current = true;
            setIsCompleted(true);
            setIsAnimating(false);
            setIsTracing(false);
            isTracingRef.current = false;
            console.log('Completed!');
          }
        }
      },

      onPanResponderRelease: () => {
        console.log('Released');
        setIsAnimating(false);
        setIsTracing(false);
        isTracingRef.current = false;

        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const resetGame = () => {
    setPacmanPos(startPoint);
    setLine('');
    setIsCompleted(false);
    setIsAnimating(false);
    setIsTracing(false);
    isTracingRef.current = false; 
    completed.current = false;
    pathRef.current = '';
    setTracedCircles([]); // Reset traced circles
    setEatenApples(new Set()); // Reset eaten apples
    rotationAnim.setValue(0);
    scaleAnim.setValue(1);
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    setContainerOffset({ x, y });
    console.log('Container layout:', { x, y });
  };

  return (
    <ImageBackground
      source={require('./assets/bg1.gif')}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>Trace Number 2</Text>
      <Text style={styles.instructions}>
        Start from the green dot and drag Pac-Man along the dotted path
      </Text>

      <View
        ref={containerRef}
        style={styles.traceBox}
        {...panResponder.panHandlers}
        onLayout={onContainerLayout}
      >
        <Svg height="300" width={canvasWidth}>
          <Circle cx={startPoint.x} cy={startPoint.y} r={15} fill="green" />
          <Circle cx={endPoint.x} cy={endPoint.y} r={15} fill="red" />

          {/* Optional: Show the traced path in a different color */}
          {line && (
            <Path 
              d={line} 
              stroke="orange" 
              strokeWidth={10} 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
          )}
        </Svg>

        {/* Render apples along the path */}
        {applePositions.map(apple => (
          !eatenApples.has(apple.id) && (
            <Image
              key={apple.id}
              source={require('./assets/apple.png')}
              style={[
                styles.appleImage,
                {
                  position: 'absolute',
                  left: apple.x - 10, // Center the apple (assuming 20px width)
                  top: apple.y - 10,  // Center the apple (assuming 20px height)
                }
              ]}
            />
          )
        ))}

        <Animated.View
          style={[
            styles.pacmanContainer,
            {
              top: pacmanPos.y - 25,
              left: pacmanPos.x - 25,
              transform: [
                {
                  rotate: rotationAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {pacmanImage}
        </Animated.View>

      </View>

      {isCompleted && (
        <Text style={styles.success}>🎉 Great Job! You traced number 2! 🎉</Text>
      )}

      <TouchableOpacity onPress={resetGame} style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
      
      {/* Debug info */}
      <Text style={styles.debugText}>
        Pac-Man at: ({Math.round(pacmanPos.x)}, {Math.round(pacmanPos.y)})
        {isTracing && " - Tracing!"}
      </Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    marginTop: 120,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  instructions: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  traceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    borderRadius: 20,
    padding: 20,
    width: canvasWidth,
    height: canvasWidth,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: -10,
    elevation: 4,
  },
  pacmanContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 10,
  },
  pacmanImage: {
    width: 50,
    height: 50,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  success: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(46,125,50,0.8)',
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  appleImage: {
    width: 20,
    height: 20,
    zIndex: 5,
  },
});