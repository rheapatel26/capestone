import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, Image } from 'react-native';

const ASSETS = {
  pacman: require('../../assets/digitTrace/1.png'),
  apple: require('../../assets/digitTrace/apple.png'),
};

// Scale coordinates to fit the game area
const scaleCoordinates = (paths: [number, number][], screenWidth: number) => {
  const gameAreaSize = screenWidth * 0.9; // 90% of screen width
  const scale = gameAreaSize / 600; // Original coordinates were in 600x600 space
  const offsetX = (gameAreaSize - (600 * scale)) / 2;
  const offsetY = (gameAreaSize - (600 * scale)) / 2;

  return paths.map(([x, y]) => [
    x * scale + offsetX,
    y * scale + offsetY
  ] as [number, number]);
};

// Helper function to generate evenly spaced points along a path
const generatePoints = (start: [number, number], end: [number, number], count: number): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    points.push([
      start[0] + (end[0] - start[0]) * i / (count - 1),
      start[1] + (end[1] - start[1]) * i / (count - 1)
    ]);
  }
  return points;
};

// Function to get a random number's path
const getRandomNumberPath = (): { number: number; path: [number, number][] } => {
  const randomNum = Math.floor(Math.random() * 10) + 1;
  return {
    number: randomNum,
    path: numberPaths[randomNum]
  };
};

const numberPaths: Record<number, [number, number][]> = {
  1: [
    ...generatePoints([300, 150], [300, 400], 8), // Vertical line
  ],
  2: [
    ...generatePoints([200, 150], [400, 150], 5), // Top horizontal
    ...generatePoints([400, 150], [400, 275], 4), // Right curve
    ...generatePoints([400, 275], [200, 275], 5), // Middle diagonal
    ...generatePoints([200, 275], [200, 400], 4), // Bottom vertical
    ...generatePoints([200, 400], [400, 400], 5), // Bottom horizontal
  ],
  3: [
    ...generatePoints([200, 150], [400, 150], 5), // Top horizontal
    ...generatePoints([400, 150], [400, 275], 4), // Upper right curve
    ...generatePoints([400, 275], [250, 275], 4), // Middle
    ...generatePoints([400, 275], [400, 400], 4), // Lower right curve
    ...generatePoints([400, 400], [200, 400], 5), // Bottom horizontal
  ],
  4: [
    ...generatePoints([200, 150], [200, 275], 4), // Left vertical
    ...generatePoints([200, 275], [400, 275], 5), // Middle horizontal
    ...generatePoints([400, 150], [400, 400], 7), // Right vertical
  ],
  5: [
    ...generatePoints([400, 150], [200, 150], 5), // Top horizontal
    ...generatePoints([200, 150], [200, 275], 4), // Left vertical
    ...generatePoints([200, 275], [400, 275], 5), // Middle horizontal
    ...generatePoints([400, 275], [400, 400], 4), // Right vertical
    ...generatePoints([400, 400], [200, 400], 5), // Bottom horizontal
  ],
  6: [
    ...generatePoints([400, 150], [200, 150], 5), // Top curve
    ...generatePoints([200, 150], [200, 400], 7), // Left vertical
    ...generatePoints([200, 400], [400, 400], 5), // Bottom horizontal
    ...generatePoints([400, 400], [400, 275], 4), // Right vertical
    ...generatePoints([400, 275], [200, 275], 5), // Middle horizontal
  ],
  7: [
    ...generatePoints([200, 150], [400, 150], 5), // Top horizontal
    ...generatePoints([400, 150], [200, 400], 8), // Diagonal
  ],
  8: [
    ...generatePoints([300, 150], [200, 150], 3), // Top left curve
    ...generatePoints([200, 150], [200, 275], 4), // Left upper vertical
    ...generatePoints([200, 275], [300, 275], 3), // Middle left curve
    ...generatePoints([300, 275], [400, 275], 3), // Middle right curve
    ...generatePoints([400, 275], [400, 400], 4), // Right lower vertical
    ...generatePoints([400, 400], [300, 400], 3), // Bottom right curve
    ...generatePoints([300, 400], [200, 400], 3), // Bottom left curve
    ...generatePoints([200, 400], [200, 275], 4), // Left lower vertical
  ],
  9: [
    ...generatePoints([300, 150], [400, 150], 3), // Top right curve
    ...generatePoints([400, 150], [400, 400], 7), // Right vertical
    ...generatePoints([400, 150], [300, 150], 3), // Top left curve
    ...generatePoints([300, 150], [200, 150], 3), // Top horizontal
    ...generatePoints([200, 150], [200, 275], 4), // Left vertical
    ...generatePoints([200, 275], [400, 275], 5), // Middle horizontal
  ],
  10: [
    ...generatePoints([200, 150], [200, 400], 7), // Left 1
    ...generatePoints([350, 150], [350, 400], 7), // Right 0
    ...generatePoints([350, 150], [450, 150], 3), // Top right curve
    ...generatePoints([450, 150], [450, 400], 7), // Far right vertical
    ...generatePoints([450, 400], [350, 400], 3), // Bottom right curve
  ]
};

export default function PacmanGame() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [apples, setApples] = useState<{ x: number; y: number; eaten: boolean }[]>([]);
  const [pacmanPos, setPacmanPos] = useState({ x: 50, y: 200 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const isDragging = useRef(false);
  const { width, height } = Dimensions.get('window');

  // Initialize level
  useEffect(() => {
    let path;
    if (currentLevel > 10) {
      const { number, path: randomPath } = getRandomNumberPath();
      setRandomNumber(number);
      path = scaleCoordinates(randomPath, width);
    } else {
      setRandomNumber(null);
      path = scaleCoordinates(numberPaths[currentLevel], width);
    }

    const newApples = path.map(([x, y]) => ({ x, y, eaten: false }));
    setApples(newApples);
    // Position Pacman at the start of the path
    const [startX, startY] = path[0];
    setPacmanPos({ x: startX, y: startY });
    setShowSuccess(false);
  }, [currentLevel, width]);

  const movePacman = (dx: number, dy: number) => {
    setPacmanPos((prev) => {
      const newX = Math.max(15, Math.min(585, prev.x + dx));
      const newY = Math.max(15, Math.min(335, prev.y + dy));
      return { x: newX, y: newY };
    });
    checkAppleCollision();
  };

  const checkAppleCollision = () => {
    setApples((prev) => {
      const updated = prev.map((apple) => {
        const dist = Math.sqrt((pacmanPos.x - apple.x) ** 2 + (pacmanPos.y - apple.y) ** 2);
        if (!apple.eaten && dist < 25) {
          setScore((s) => s + 10);
          return { ...apple, eaten: true };
        }
        return apple;
      });

      if (updated.every((a) => a.eaten)) {
        setTimeout(() => setShowSuccess(true), 300);
      }
      return updated;
    });
  };

  const nextLevel = () => {
    setCurrentLevel((l) => {
      // After level 10, generate new random levels
      if (l >= 10) {
        const { number } = getRandomNumberPath();
        setRandomNumber(number);
        return l + 1;
      }
      return l + 1;
    });
  };

  const prevLevel = () => {
    if (currentLevel > 1) setCurrentLevel((l) => l - 1);
  };

  const resetLevel = () => {
    if (currentLevel > 10) {
      // For random levels, generate a new random number
      const { number, path: randomPath } = getRandomNumberPath();
      setRandomNumber(number);
      const scaledPath = scaleCoordinates(randomPath, width);
      const newApples = scaledPath.map(([x, y]) => ({ x, y, eaten: false }));
      setApples(newApples);
      const [startX, startY] = scaledPath[0];
      setPacmanPos({ x: startX, y: startY });
    } else {
      const path = scaleCoordinates(numberPaths[currentLevel], width);
      const newApples = path.map(([x, y]) => ({ x, y, eaten: false }));
      setApples(newApples);
      const [startX, startY] = path[0];
      setPacmanPos({ x: startX, y: startY });
    }
    setShowSuccess(false);
    setScore(0);
  };

  // Drag & Touch
  const handleDrag = (e: any) => {
    if (!isDragging.current) return;

    const touch = e.nativeEvent.touches[0];
    const locationX = touch.locationX;
    const locationY = touch.locationY;

    // Make sure Pacman stays within the game area bounds
    const gameAreaSize = width * 0.9;
    const newX = Math.max(15, Math.min(gameAreaSize - 15, locationX));
    const newY = Math.max(15, Math.min(gameAreaSize - 15, locationY));

    setPacmanPos({ x: newX, y: newY });
    checkAppleCollision();
  };

  return (
    <ImageBackground
      source={require('../../assets/Digit_Tracing_bg.gif')}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pacman Number Tracing</Text>
        <Text style={styles.levelInfo}>
          {currentLevel > 10
            ? `Random Level - Trace Number ${randomNumber}`
            : `Level ${currentLevel} - Trace Number ${currentLevel}`
          }
        </Text>
        <Text style={styles.instructions}>Move Pacman with touch gestures to eat apples along the number!</Text>
      </View>

      <Text style={styles.score}>Score: {score}</Text>

      <View
        style={styles.gameArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={() => isDragging.current = true}
        onResponderMove={handleDrag}
        onResponderRelease={() => isDragging.current = false}
      >
        <Text style={styles.numberDisplay}>
          {currentLevel > 10 ? randomNumber : currentLevel}
        </Text>

        {apples.map((apple, i) => (
          <Image
            key={i}
            source={ASSETS.apple}
            style={[
              styles.apple,
              apple.eaten && styles.appleEaten,
              { left: apple.x - 10, top: apple.y - 10 }
            ]}
          />
        ))}

        <View
          style={[{ left: pacmanPos.x - 15, top: pacmanPos.y - 15, position: 'absolute' }]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => isDragging.current = true}
        >
          <Image
            source={ASSETS.pacman}
            style={styles.pacman}
          />
        </View>

        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Great Job! 🎉</Text>
            <Text style={styles.successSubtext}>Level Complete!</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {/* Row for first two buttons */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button}
            onPress={resetLevel}
          >
            <Text style={styles.buttonText}>Reset Level</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={nextLevel}
          >
            <Text style={styles.buttonText}>Next Level</Text>
          </TouchableOpacity>
        </View>

        {/* Third button below */}
        <TouchableOpacity 
  style={[
    styles.button, 
    styles.centerButton, 
    { width: 200, marginLeft:50 }, // Increase width here
    currentLevel <= 1 && styles.buttonDisabled
  ]}
  onPress={prevLevel}
  disabled={currentLevel <= 1}
>
  <Text style={styles.buttonText}>Previous Level</Text>
</TouchableOpacity>
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'PixelFont',
    marginTop: 50,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  levelInfo: {
    fontSize: 18,
    color: '#E0F7FA',
    fontFamily: 'PixelFont',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 18,
    color: '#E0F7FA',
    fontFamily: 'PixelFont',
    textAlign: 'center',
  },
  score: { 
    fontSize: 20,
    color: '#FFD700',
    fontFamily: 'PixelFont',
    textAlign: 'center',
    marginVertical: 10,
  },
  gameArea: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 20,
  },
  numberDisplay: {
    fontSize: 100,
    color: 'rgba(0, 0, 0, 0.05)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'PixelFont',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    marginTop: 270,
    marginLeft: -100,
  },
  apple: {
    width: 30,
    height: 30,
    position: 'absolute',
    resizeMode: 'contain',
  },
  appleEaten: {
    opacity: 0,
  },
  pacman: {
    width: 40,
    height: 40,
    position: 'absolute',
    resizeMode: 'contain',
  },
  successMessage: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  successText: {
    fontSize: 24,
    color: '#FFD700',
    fontFamily: 'PixelFont',
    marginBottom: 10,
  },
  successSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'PixelFont',
  },
  controls: {
  alignItems: 'center', // centers everything
  marginTop: -10,
  padding: 20,
},
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%', // control spacing of first two buttons
  marginBottom: 15,
},
button: {
  backgroundColor: '#1976D2',
  paddingVertical: 12,
  paddingHorizontal: 10,
  borderRadius: 15,
  width: 150, // adjust width
  alignItems: 'center',
  marginRight: 30,
  marginLeft: -15,
  elevation: 3,
},
centerButton: {
  alignSelf: 'center',
},
  buttonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'PixelFont',
    fontSize: 14,
  },
});