import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as pathUtils from 'svg-path-properties';

const screenWidth = Dimensions.get('window').width;
const canvasWidth = screenWidth - 40;

const numberPath = "M150 80 L250 80 Q280 80 280 110 L280 140 L150 200 L150 230 L280 230";
const startPoint = { x: 150, y: 80 };
const endPoint = { x: 280, y: 230 };
const allowedOffset = 30;

export default function App() {
  const [line, setLine] = useState('');
  const [pacmanPos, setPacmanPos] = useState(startPoint);
  const [isCompleted, setIsCompleted] = useState(false);
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });

  const pathRef = useRef('');
  const completed = useRef(false);
  const properties = new pathUtils.svgPathProperties(numberPath);

  const isNearPath = (x: number, y: number): boolean => {
    const length = properties.getTotalLength();
    for (let i = 0; i <= length; i += 5) {
      const { x: px, y: py } = properties.getPointAtLength(i);
      if (Math.hypot(px - x, py - y) < allowedOffset) return true;
    }
    return false;
  };

  const isAtEnd = (x: number, y: number): boolean => {
    return Math.hypot(endPoint.x - x, endPoint.y - y) < allowedOffset;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pathRef.current = '';
      },

      onPanResponderMove: (_, gesture) => {
        const x = gesture.moveX - containerOffset.x;
        const y = gesture.moveY - containerOffset.y;

        if (isNearPath(x, y)) {
          if (!pathRef.current) {
            pathRef.current = `M ${startPoint.x} ${startPoint.y} L ${x} ${y} `;
          } else {
            pathRef.current += `L ${x} ${y} `;
          }

          setLine(pathRef.current);
          setPacmanPos({ x, y });

          if (isAtEnd(x, y) && !completed.current) {
            completed.current = true;
            setIsCompleted(true);
          }
        }
      },

      onPanResponderRelease: () => {
        pathRef.current = '';
      },
    })
  ).current;

  const resetGame = () => {
    setPacmanPos(startPoint);
    setLine('');
    setIsCompleted(false);
    completed.current = false;
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    setContainerOffset({ x, y });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trace Number 2</Text>
      <Text style={styles.instructions}>
        Drag Pac-Man along the dotted path to trace the number
      </Text>

      <View
        style={styles.traceBox}
        {...panResponder.panHandlers}
        onLayout={onContainerLayout}
      >
        <Svg height="300" width={canvasWidth}>
          <Path
            d={numberPath}
            stroke="#ccc"
            strokeWidth="12"
            strokeDasharray="10,10"
            fill="none"
          />

          <Circle cx={startPoint.x} cy={startPoint.y} r={10} fill="green" />
          <Circle cx={endPoint.x} cy={endPoint.y} r={10} fill="red" />

          {line && <Path d={line} stroke="blue" strokeWidth={6} fill="none" />}
        </Svg>

        <Image
          source={require('./assets/1.png')}
          style={[
            styles.pacmanImage,
            { top: pacmanPos.y - 25, left: pacmanPos.x - 25 },
          ]}
        />
      </View>

      {isCompleted && (
        <Text style={styles.success}>🎉 Great Job! This is number 2! 🎉</Text>
      )}

      <TouchableOpacity onPress={resetGame} style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf0fb',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  instructions: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
    color: '#555',
    textAlign: 'center',
  },
  traceBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: canvasWidth,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  pacmanImage: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 10,
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
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});
