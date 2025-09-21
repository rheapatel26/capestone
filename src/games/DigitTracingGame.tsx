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

  Vibration,                          

} from 'react-native';



import Svg, { Path, Circle, Defs, Mask, Rect } from 'react-native-svg';

import * as pathUtils from 'svg-path-properties';

const screenWidth = Dimensions.get('window').width;

const canvasWidth = screenWidth - 40;



const ASSETS = {

    background: require('../../assets/Digit_Tracing_bg.png'),

    pacman: require('../../assets/1.png'),

    apple: require('../../assets/apple.png'),

};



// Define paths for digits 0-9

const digitPaths = {

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



// Get start and end points for each digit

const getDigitPoints = (digit: number) => {

  const path = digitPaths[digit as keyof typeof digitPaths];

  const properties = new pathUtils.svgPathProperties(path);

  const startPoint = properties.getPointAtLength(0);

  const endPoint = properties.getPointAtLength(properties.getTotalLength());

  return { startPoint, endPoint, path };

};



const allowedOffset = 50;

const PACMAN_TOUCH_RADIUS = 60;



// Generate apple positions along the path

const generateApplePositions = (path: string) => {

  const properties = new pathUtils.svgPathProperties(path);

  const totalLength = properties.getTotalLength();

  const appleSpacing = 25;

  const positions = [];



  for (let i = 0; i <= totalLength; i += appleSpacing) {

    const point = properties.getPointAtLength(i);

    positions.push({ x: point.x, y: point.y, id: i });

  }

 

  return positions;

};



// Generate dotted line points for visual guidance

const generateDottedPath = (path: string) => {

  const properties = new pathUtils.svgPathProperties(path);

  const totalLength = properties.getTotalLength();

  const dotSpacing = 15;

  const dots = [];



  for (let i = 0; i <= totalLength; i += dotSpacing) {

    const point = properties.getPointAtLength(i);

    dots.push({ x: point.x, y: point.y, id: i });

  }

 

  return dots;

};



export default function DigitTracingGame() {

  const [currentLevel, setCurrentLevel] = useState(0); // Start with digit 0

  const [line, setLine] = useState('');

  const [pacmanPos, setPacmanPos] = useState(() => getDigitPoints(0).startPoint);

  const [isCompleted, setIsCompleted] = useState(false);

  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });

  const [isAnimating, setIsAnimating] = useState(false);

  const [isTracing, setIsTracing] = useState(false);

  const [tracedCircles, setTracedCircles] = useState<Array<{x: number, y: number, id: number}>>([]);

  const [eatenApples, setEatenApples] = useState<Set<number>>(new Set());

  const [showHint, setShowHint] = useState(true);

  const [progress, setProgress] = useState(0);

  const [gameStarted, setGameStarted] = useState(false);



  // Get current digit info

  const currentDigitInfo = useMemo(() => getDigitPoints(currentLevel), [currentLevel]);

  const [applePositions, setApplePositions] = useState(() => generateApplePositions(currentDigitInfo.path));

  const [dottedPath, setDottedPath] = useState(() => generateDottedPath(currentDigitInfo.path));



  const pathRef = useRef('');

  const completed = useRef(false);

  const containerRef = useRef<View>(null);

  const isTracingRef = useRef(false);

  const properties = useMemo(() => new pathUtils.svgPathProperties(currentDigitInfo.path), [currentDigitInfo.path]);

  const rotationAnim = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const hintAnim = useRef(new Animated.Value(0)).current;



  // Update positions when level changes

  useEffect(() => {

    const digitInfo = getDigitPoints(currentLevel);

    setPacmanPos(digitInfo.startPoint);

    setApplePositions(generateApplePositions(digitInfo.path));

    setDottedPath(generateDottedPath(digitInfo.path));

    resetGameState();

  }, [currentLevel]);



  // Pulsing animation for Pac-Man when not started

  useEffect(() => {

    if (!gameStarted) {

      Animated.loop(

        Animated.sequence([

          Animated.timing(pulseAnim, {

            toValue: 1.3,

            duration: 800,

            useNativeDriver: true,

          }),

          Animated.timing(pulseAnim, {

            toValue: 1,

            duration: 800,

            useNativeDriver: true,

          }),

        ])

      ).start();

    } else {

      pulseAnim.setValue(1);

    }

  }, [gameStarted]);



  // Hint animation

  useEffect(() => {

    if (showHint) {

      Animated.loop(

        Animated.timing(hintAnim, {

          toValue: 1,

          duration: 2000,

          useNativeDriver: true,

        })

      ).start();

    }

  }, [showHint]);



  const pacmanImage = useMemo(() => (

    <Image

      source={ASSETS.pacman}

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



  const isTouchOnPacman = (touchX: number, touchY: number): boolean => {

    const distance = Math.hypot(pacmanPos.x - touchX, pacmanPos.y - touchY);

    return distance < PACMAN_TOUCH_RADIUS;

  };



  const isNearStartPoint = (x: number, y: number): boolean => {

    return Math.hypot(currentDigitInfo.startPoint.x - x, currentDigitInfo.startPoint.y - y) < allowedOffset;

  };



  const isAtEnd = (x: number, y: number): boolean => {

    return Math.hypot(currentDigitInfo.endPoint.x - x, currentDigitInfo.endPoint.y - y) < allowedOffset;

  };



  // Calculate progress based on apples eaten (more resistance - apples must be eaten)

  const calculateProgress = () => {

    const totalApples = applePositions.length;

    const eatenApplesCount = eatenApples.size;

    return totalApples > 0 ? (eatenApplesCount / totalApples) * 100 : 0;

  };



  const resetGameState = () => {

    setLine('');

    setIsCompleted(false);

    setIsAnimating(false);

    setIsTracing(false);

    setGameStarted(false);

    setShowHint(true);

    setProgress(0);

    isTracingRef.current = false;

    completed.current = false;

    pathRef.current = '';

    setTracedCircles([]);

    setEatenApples(new Set());

    rotationAnim.setValue(0);

    scaleAnim.setValue(1);

    pulseAnim.setValue(1);

  };



  const nextLevel = () => {

    if (currentLevel < 9) {

      setCurrentLevel(currentLevel + 1);

    } else {

      // All levels completed

      alert('Congratulations! You completed all digit levels!');

    }

  };



  const resetGame = () => {

    const digitInfo = getDigitPoints(currentLevel);

    setPacmanPos(digitInfo.startPoint);

    resetGameState();

  };



  const panResponder = useRef(

    PanResponder.create({

      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: () => true,



      onPanResponderGrant: (evt, gesture) => {

        const x = evt.nativeEvent.locationX;

        const y = evt.nativeEvent.locationY;

       

        if (isTouchOnPacman(x, y) || isNearStartPoint(x, y) || isNearPath(x, y)) {

          setIsTracing(true);

          setGameStarted(true);

          setShowHint(false);

          isTracingRef.current = true;

          setIsAnimating(true);

          pathRef.current = `M ${pacmanPos.x} ${pacmanPos.y}`;

         

          Vibration.vibrate(100);

         

          Animated.sequence([

            Animated.timing(scaleAnim, {

              toValue: 1.2,

              duration: 100,

              useNativeDriver: true,

            }),

            Animated.timing(scaleAnim, {

              toValue: 1,

              duration: 100,

              useNativeDriver: true,

            }),

          ]).start();

        }

      },



      onPanResponderMove: (evt, gesture) => {

        if (!isTracingRef.current) {

          return;

        }



        const x = evt.nativeEvent.locationX;

        const y = evt.nativeEvent.locationY;



        if (isNearPath(x, y)) {

          pathRef.current += ` L ${x} ${y}`;

          setLine(pathRef.current);

         

          // Check if Pac-Man is near any apples and "eat" them with enhanced feedback

          applePositions.forEach(apple => {

            if (!eatenApples.has(apple.id) && Math.hypot(apple.x - x, apple.y - y) < 30) {

              setEatenApples(prev => new Set([...prev, apple.id]));

              Vibration.vibrate([50, 50, 100]);

            }

          });

         

          // Update progress based on apples eaten (resistance system)

          const currentProgress = calculateProgress();

          setProgress(currentProgress);

         

          setTracedCircles(prev => [

            ...prev,

            { x, y, id: Date.now() + Math.random() }

          ]);



          const newRotation = calculateRotation(pacmanPos, { x, y });

          Animated.timing(rotationAnim, {

            toValue: newRotation,

            duration: 100,

            useNativeDriver: true,

          }).start();



          setPacmanPos({ x, y });



          // Check completion only when all apples are eaten and at end point

          if (isAtEnd(x, y) && eatenApples.size === applePositions.length && !completed.current) {

            completed.current = true;

            setIsCompleted(true);

            setIsAnimating(false);

            setIsTracing(false);

            isTracingRef.current = false;

            setProgress(100);

           

            Animated.sequence([

              Animated.timing(scaleAnim, {

                toValue: 1.5,

                duration: 200,

                useNativeDriver: true,

              }),

              Animated.timing(scaleAnim, {

                toValue: 1,

                duration: 200,

                useNativeDriver: true,

              }),

            ]).start();

           

            Vibration.vibrate([200, 100, 200, 100, 400]);

          }

        } else {

          setTimeout(() => {

            if (!isNearPath(x, y)) {

              setPacmanPos({ x, y });

             

              const newRotation = calculateRotation(pacmanPos, { x, y });

              Animated.timing(rotationAnim, {

                toValue: newRotation,

                duration: 100,

                useNativeDriver: true,

              }).start();

            }

          }, 200);

        }

      },



      onPanResponderRelease: () => {

        setIsAnimating(false);

        Animated.timing(scaleAnim, {

          toValue: 1,

          duration: 200,

          useNativeDriver: true,

        }).start();

      },

    })

  ).current;



  const onContainerLayout = (event: LayoutChangeEvent) => {

    const { x, y } = event.nativeEvent.layout;

    setContainerOffset({ x, y });

  };



  return (

    <ImageBackground

      source={ASSETS.background}

      style={styles.container}

      resizeMode="cover"

    >

      <View style={styles.levelContainer}>

        <Text style={styles.levelText}>Level: {currentLevel + 1}/10</Text>

        <Text style={styles.digitText}>Digit: {currentLevel}</Text>

      </View>



      <View style={styles.progressContainer}>

        <Text style={styles.progressText}>Progress: {Math.round(progress)}%</Text>

        <Text style={styles.applesText}>Apples: {eatenApples.size}/{applePositions.length}</Text>

        <View style={styles.progressBarBg}>

          <View style={[styles.progressBar, { width: `${progress}%` }]} />

        </View>

      </View>



      <View

        ref={containerRef}

        style={styles.traceBox}

        {...panResponder.panHandlers}

        onLayout={onContainerLayout}

      >

        <Svg height="300" width={canvasWidth}>

          {showHint && dottedPath.map((dot, index) => (

            <Circle

              key={`dot-${index}`}

              cx={dot.x}

              cy={dot.y}

              r={3}

              fill="rgba(100, 100, 100, 0.5)"

            />

          ))}



          {line ? (

            <Path

              d={line}

              stroke="orange"

              strokeWidth={12}

              fill="none"

              strokeLinecap="round"

              strokeLinejoin="round"

              opacity={0.8}

            />

          ) : null}

        </Svg>



        {applePositions.map((apple) => {

          if (eatenApples.has(apple.id)) {

            return null;

          }

          return (

            <Image

              key={apple.id}

              source={ASSETS.apple}

              style={[

                styles.appleImage,

                {

                  position: 'absolute',

                  left: apple.x - 10,

                  top: apple.y - 10,

                }

              ]}

            />

          );

        })}



        <Animated.View

          style={[

            styles.pacmanContainer,

            {

              top: pacmanPos.y - 30,

              left: pacmanPos.x - 30,

              transform: [

                {

                  rotate: rotationAnim.interpolate({

                    inputRange: [0, 360],

                    outputRange: ['0deg', '360deg'],

                  }),

                },

                { scale: gameStarted ? scaleAnim : pulseAnim },

              ],

            },

          ]}

        >

          <View style={styles.touchArea} />

          {pacmanImage}

         

          {!gameStarted && (

            <Animated.View

              style={[

                styles.touchIndicator,

                {

                  transform: [

                    {

                      scale: hintAnim.interpolate({

                        inputRange: [0, 1],

                        outputRange: [1, 1.8],

                      }),

                    },

                  ],

                  opacity: hintAnim.interpolate({

                    inputRange: [0, 1],

                    outputRange: [0.8, 0],

                  }),

                },

              ]}

            />

          )}

        </Animated.View>

      </View>



      {isCompleted ? (

        <View style={styles.completionContainer}>

          <Text style={styles.success}>Fantastic! You traced number {currentLevel}!</Text>

          <Text style={styles.completionStats}>

            Apples eaten: {eatenApples.size}/{applePositions.length}

          </Text>

        </View>

      ) : null}



      <View style={styles.buttonContainer}>

        <TouchableOpacity onPress={resetGame} style={styles.button}>

          <Text style={styles.buttonText}>

            {isCompleted ? "Try Again" : "Reset"}

          </Text>

        </TouchableOpacity>

        

        {(progress === 100 && eatenApples.size === applePositions.length) && (

          <TouchableOpacity onPress={nextLevel} style={styles.nextButton}>

            <Text style={styles.nextButtonText}>

              {currentLevel < 9 ? "Next" : "Finish"}

            </Text>

          </TouchableOpacity>

        )}

      </View>



      <View style={styles.statusContainer}>

        <Text style={styles.statusText}>

          {!gameStarted ? "Touch Pac-Man to start!" :

           isTracing ? "Great! Keep going!" :

           "Touch Pac-Man to continue"}

        </Text>

      </View>

    </ImageBackground>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    alignItems: 'center',

    paddingTop: 60,

    justifyContent: 'space-between',

  },

  levelContainer: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    width: canvasWidth,

    marginBottom: 15,

    paddingHorizontal: 20,

  },

  levelText: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#FFFFFF',

    backgroundColor: 'rgba(77, 128, 128, 0.8)',

    paddingHorizontal: 15,

    paddingVertical: 8,

    borderRadius: 15,

  },

  digitText: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#FFFFFF',

    backgroundColor: 'rgba(25, 118, 210, 0.8)',

    paddingHorizontal: 15,

    paddingVertical: 8,

    borderRadius: 15,

  },

  progressContainer: {

    alignItems: 'center',

    marginBottom: 15,

  },

  progressText: {

    fontSize: 14,

    color: '#FFFFFF',

    fontWeight: 'bold',

    marginBottom: 3,

  },

  applesText: {

    fontSize: 12,

    color: '#FFFFFF',

    fontWeight: '600',

    marginBottom: 8,

    backgroundColor: 'rgba(76, 175, 80, 0.7)',

    paddingHorizontal: 12,

    paddingVertical: 3,

    borderRadius: 10,

  },

  progressBarBg: {

    width: canvasWidth - 40,

    height: 10,

    backgroundColor: 'rgba(255, 255, 255, 0.3)',

    borderRadius: 5,

    overflow: 'hidden',

  },

  progressBar: {

    height: '100%',

    backgroundColor: '#4CAF50',

    borderRadius: 5,

  },

  traceBox: {

    backgroundColor: 'rgba(255, 255, 255, 0.85)',

    borderRadius: 20,

    padding: 20,

    width: canvasWidth,

    height: canvasWidth * 0.9, // Slightly smaller to make room for buttons

    justifyContent: 'center',

    alignItems: 'center',

    elevation: 4,

    borderWidth: 3,

    borderColor: 'rgba(25, 118, 210, 0.3)',

  },

  pacmanContainer: {

    position: 'absolute',

    width: 60,

    height: 60,

    zIndex: 10,

    justifyContent: 'center',

    alignItems: 'center',

  },

  pacmanImage: {

    width: 50,

    height: 50,

  },

  touchArea: {

    position: 'absolute',

    width: PACMAN_TOUCH_RADIUS * 2,

    height: PACMAN_TOUCH_RADIUS * 2,

    top: -PACMAN_TOUCH_RADIUS + 25,

    left: -PACMAN_TOUCH_RADIUS + 25,

    backgroundColor: 'transparent',

  },

  touchIndicator: {

    position: 'absolute',

    width: 60,

    height: 60,

    borderRadius: 30,

    borderWidth: 3,

    borderColor: '#4CAF50',

    backgroundColor: 'rgba(76, 175, 80, 0.1)',

  },

  completionContainer: {

    alignItems: 'center',

    marginTop: 15,

    marginBottom: 10,

  },

  success: {

    fontSize: 16,

    color: '#FFD700',

    fontWeight: 'bold',

    backgroundColor: 'rgba(25, 118, 210, 0.9)',

    paddingVertical: 8,

    paddingHorizontal: 15,

    borderRadius: 12,

    textAlign: 'center',

    borderColor: '#FFFFFF',

    borderWidth: 2,

    marginBottom: 5,

  },

  completionStats: {

    fontSize: 12,

    color: '#FFFFFF',

    fontWeight: 'bold',

    backgroundColor: 'rgba(76, 175, 80, 0.8)',

    paddingVertical: 6,

    paddingHorizontal: 12,

    borderRadius: 8,

    borderColor: '#FFFFFF',

    borderWidth: 1,

    marginBottom: 8,

  },

  nextButton: {

    backgroundColor: '#4CAF50',

    paddingVertical: 12,

    paddingHorizontal: 25,

    borderRadius: 20,

    elevation: 5,

    borderWidth: 2,

    borderColor: '#FFFFFF',

    marginLeft: 15,

  },

  nextButtonText: {

    color: '#fff',

    fontWeight: 'bold',

    fontSize: 14,

  },

  buttonContainer: {

    marginBottom: 15,

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    width: canvasWidth,

  },

  button: {

    backgroundColor: '#1976D2',

    paddingVertical: 12,

    paddingHorizontal: 25,

    borderRadius: 20,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.25,

    shadowRadius: 3.84,

    borderWidth: 2,

    borderColor: '#FFFFFF',

  },

  buttonText: {

    color: '#fff',

    fontWeight: 'bold',

    fontSize: 14,

  },

  statusContainer: {

    marginBottom: 10,

    backgroundColor: 'rgba(255, 255, 255, 0.9)',

    paddingVertical: 8,

    paddingHorizontal: 15,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: '#1976D2',

  },

  statusText: {

    fontSize: 12,

    color: '#1976D2',

    fontWeight: 'bold',

    textAlign: 'center',

  },

  appleImage: {

    width: 17,

    height: 17,

    zIndex: 5,

  },

});