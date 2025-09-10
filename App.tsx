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

// Define paths for all numbers 0-9
const numberPaths = {
  0: "M200 80 Q240 80 260 120 L260 180 Q260 220 220 230 L180 230 Q140 220 140 180 L140 120 Q140 80 180 80 Z",
  1: "M180 80 L200 80 L200 230 M170 100 L200 80",
  2: "M150 80 L250 80 Q280 80 280 110 L280 140 L150 200 L150 230 L280 230",
  3: "M150 80 L280 80 Q310 80 310 110 L310 130 Q310 155 280 155 L250 155 M280 155 Q310 155 310 180 L310 200 Q310 230 280 230 L150 230",
  4: "M180 80 L180 180 L280 180 M240 80 L240 230",
  5: "M280 80 L150 80 L150 155 L250 155 Q280 155 280 180 L280 200 Q280 230 250 230 L150 230",
  6: "M280 120 Q250 80 200 80 Q150 80 150 130 L150 180 Q150 230 200 230 Q250 230 280 200 Q280 180 250 180 Q200 180 150 180",
  7: "M150 80 L280 80 L200 230",
  8: "M200 80 Q150 80 150 110 Q150 130 200 155 Q250 130 250 110 Q250 80 200 80 Q250 80 280 110 Q280 130 200 155 Q150 180 150 200 Q150 230 200 230 Q250 230 280 200 Q280 180 200 155",
  9: "M150 190 Q150 160 180 160 Q230 160 280 160 Q280 110 250 80 Q200 80 150 80 Q120 80 120 110 L120 130 Q120 180 170 210 Q220 230 280 190"
};

// Define start and end points for each number
const numberPoints = {
  0: { start: { x: 200, y: 80 }, end: { x: 180, y: 80 } },
  1: { start: { x: 180, y: 80 }, end: { x: 200, y: 230 } },
  2: { start: { x: 150, y: 80 }, end: { x: 280, y: 230 } },
  3: { start: { x: 150, y: 80 }, end: { x: 150, y: 230 } },
  4: { start: { x: 180, y: 80 }, end: { x: 240, y: 230 } },
  5: { start: { x: 280, y: 80 }, end: { x: 150, y: 230 } },
  6: { start: { x: 280, y: 120 }, end: { x: 150, y: 180 } },
  7: { start: { x: 150, y: 80 }, end: { x: 200, y: 230 } },
  8: { start: { x: 200, y: 80 }, end: { x: 200, y: 155 } },
  9: { start: { x: 150, y: 190 }, end: { x: 280, y: 190 } }
};

const allowedOffset = 40; // Increased tolerance for easier tracing

// Generate apple positions along the path
const generateApplePositions = (pathString: string) => {
  const properties = new pathUtils.svgPathProperties(pathString);
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
  const [currentLevel, setCurrentLevel] = useState(0); // Start with level 0 (number 0)
  const [line, setLine] = useState('');
  const [pacmanPos, setPacmanPos] = useState(numberPoints[0 as keyof typeof numberPoints].start);
  const [isCompleted, setIsCompleted] = useState(false);
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [tracedCircles, setTracedCircles] = useState<Array<{x: number, y: number, id: number}>>([]); // New state for traced positions
  const [applePositions, setApplePositions] = useState(() => generateApplePositions(numberPaths[0 as keyof typeof numberPaths])); // Generate apple positions for current level
  const [eatenApples, setEatenApples] = useState<Set<number>>(new Set()); // Track eaten apples
  const [score, setScore] = useState(0); // Track the score (number of apples eaten)
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // Track if user reached end point

  const pathRef = useRef('');
  const completed = useRef(false);
  const containerRef = useRef<View>(null);
  const isTracingRef = useRef(false); 
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get current level data
  const currentPath = numberPaths[currentLevel as keyof typeof numberPaths];
  const currentStartPoint = numberPoints[currentLevel as keyof typeof numberPoints].start;
  const currentEndPoint = numberPoints[currentLevel as keyof typeof numberPoints].end;
  const properties = useMemo(() => new pathUtils.svgPathProperties(currentPath), [currentPath]);

  const pacmanImage = useMemo(() => (
    <Image
      source={require('./assets/1.gif')}
      style={styles.pacmanImage}
    />
  ), []);

  // Update apple positions when level changes
  useEffect(() => {
    setApplePositions(generateApplePositions(currentPath));
    setPacmanPos(currentStartPoint);
    resetGameState();
  }, [currentLevel, currentPath, currentStartPoint]);

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
    return Math.hypot(currentStartPoint.x - x, currentStartPoint.y - y) < allowedOffset;
  };

  const isAtEnd = (x: number, y: number): boolean => {
    return Math.hypot(currentEndPoint.x - x, currentEndPoint.y - y) < allowedOffset;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gesture) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        
        console.log('Touch start at:', x, y);
        console.log('Start point:', currentStartPoint);
        console.log('Near start?', isNearStartPoint(x, y));
        
        // Allow tracing if near start point or already tracing
        if (isNearStartPoint(x, y) || isTracingRef.current) {
          setIsTracing(true);
          isTracingRef.current = true; 
          setIsAnimating(true);
          pathRef.current = `M ${currentStartPoint.x} ${currentStartPoint.y}`;
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
  if (Math.hypot(apple.x - x, apple.y - y) < 25) {
    setEatenApples(prev => {
      if (!prev.has(apple.id)) {
        const updated = new Set(prev);
        updated.add(apple.id);
        setScore(updated.size); // ✅ Update score here
        return updated;
      }
      return prev;
    });
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

  // Finalize score once completed
  setScore(eatenApples.size);

  console.log('Completed! Final Score:', eatenApples.size);
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

  const resetGameState = () => {
    setLine('');
    setIsCompleted(false);
    setIsAnimating(false);
    setIsTracing(false);
    isTracingRef.current = false;
    completed.current = false;
    pathRef.current = '';
    setTracedCircles([]);
    setEatenApples(new Set());
    rotationAnim.setValue(0);
    scaleAnim.setValue(1);
  };

  const resetGame = () => {
    setPacmanPos(currentStartPoint);
    resetGameState();
  };

  const goToNextLevel = () => {
    if (currentLevel < 9) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const goToPrevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
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
      <Text style={styles.title}>Trace Number {currentLevel}</Text>
      <Text style={styles.levelIndicator}>Level {currentLevel + 1} of 10</Text>
      <Text style={styles.instructions}>
        Start from the green dot and drag Pac-Man along the dotted path
      </Text>

      {/* Level Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={goToPrevLevel}
          style={[styles.navButton, currentLevel === 0 && styles.disabledButton]}
          disabled={currentLevel === 0}
        >
          <Text style={[styles.navButtonText, currentLevel === 0 && styles.disabledText]}>
            ← Prev
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.levelText}>Number {currentLevel}</Text>
        
        <TouchableOpacity
          onPress={goToNextLevel}
          style={[styles.navButton, currentLevel === 9 && styles.disabledButton]}
          disabled={currentLevel === 9}
        >
          <Text style={[styles.navButtonText, currentLevel === 9 && styles.disabledText]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      <View
        ref={containerRef}
        style={styles.traceBox}
        {...panResponder.panHandlers}
        onLayout={onContainerLayout}
      >
        <Svg height="300" width={canvasWidth}>
          <Circle cx={currentStartPoint.x} cy={currentStartPoint.y} r={15} fill="green" />
          <Circle cx={currentEndPoint.x} cy={currentEndPoint.y} r={15} fill="red" />

          {/* Show the target number path as a dotted line */}
          <Path 
            d={currentPath} 
            stroke="gray" 
            strokeWidth={3} 
            fill="none"
            strokeDasharray="5,5"
            opacity={0.5}
          />

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
  <View style={styles.completionContainer}>
    <Text style={styles.success}>
      🎉 Great Job! You traced number {currentLevel}! 🎉
    </Text>
    <Text style={styles.finalScore}>
      🍎 Apples eaten: {score}
    </Text>
  </View>
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
  levelIndicator: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  instructions: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: canvasWidth,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
    textAlign: 'center',
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  finalScore: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,107,53,0.8)',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  appleImage: {
    width: 17,
    height: 17,
    zIndex: 5,
  },
});