import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CommonActions } from '@react-navigation/native';

// Define the types for your navigation stack
type AppStackParamList = {
  SignIn: undefined;
  SignUP: undefined;
  Dashboard: undefined;
  MainTabs: undefined;
  DigitTracingGame: undefined;
  ClockTimeGame: undefined;
  BubbleCountingGame: undefined;
  AddSubBubblesGame: undefined;
  MoneyConceptGame: undefined;
};

type SignUpNavProp = NativeStackNavigationProp<AppStackParamList, "SignUP">;

const ASSETS = {
  background: require("../../assets/signupbg.png"), // Adjust path as needed
};

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpNavProp>();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your name.");
      return false;
    }
    
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      Alert.alert("Validation Error", "Please enter a valid age (1-120).");
      return false;
    }
    
    if (password.length < 4) {
      Alert.alert("Validation Error", "Password must be at least 4 characters long.");
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return false;
    }
    
    return true;
  };

  // Store user data (in a real app, this would be sent to a backend)
  const storeUserData = async (userData: any) => {
    try {
      // In a real app, you might use AsyncStorage or send to backend
      // For now, we'll just simulate a successful signup
      
      // Example of how you might store locally:
      // import AsyncStorage from '@react-native-async-storage/async-storage';
      // await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('User data stored:', userData);
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        name: name.trim(),
        age: Number(age),
        password: password, // In real app, this should be hashed
        createdAt: new Date().toISOString(),
        id: Date.now().toString(), // Simple ID generation
      };

      const success = await storeUserData(userData);

      if (success) {
        Alert.alert(
          "Welcome to MATH.IO!", 
          `Great to have you, ${name}! Your account has been created successfully. Let's start your mathematical adventure!`,
          [
            {
              text: "Start Learning!",
              onPress: () => {
                // Navigate directly to MainTabs after successful signup
                navigation.navigate('MainTabs');
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setName('');
    setAge('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ImageBackground
      source={ASSETS.background}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>MATH.IO</Text>
            <Text style={styles.subtitle}>LEARN. PLAY. CHALLENGE</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Join the Fun!</Text>
            <Text style={styles.formSubtitle}>Create your learning profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="What's your name?"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            
            <TextInput
              style={styles.input}
              placeholder="How old are you?"
              placeholderTextColor="#A0A0A0"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
              returnKeyType="next"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Create a secret password (min 4 characters)"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Type your password again"
              placeholderTextColor="#A0A0A0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Creating Your Account..." : "🚀 Start My Adventure!"}
              </Text>
            </TouchableOpacity>

            {/* Clear form button */}
            <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
              <Text style={styles.clearButtonText}>🗑️ Clear Form</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>

          {/* Quick demo button for testing */}
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => {
              setName('Alex');
              setAge('8');
              setPassword('demo');
              setConfirmPassword('demo');
            }}
          >
            <Text style={styles.demoButtonText}>⚡ Fill Demo Data</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: 'PixelFont',
    color: "#5b00b1ff",
    textShadowColor: "#7f7f7fff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#DDA0DD",
    marginTop: 5,
    fontFamily: 'PixelFont',
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'PixelFont',
    color: "#4B0082",
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: "#6A5ACD",
    marginBottom: 20,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'PixelFont',
  },
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'PixelFont',
    borderWidth: 2,
    borderColor: "transparent",
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#6A5ACD",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'PixelFont',
  },
  clearButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  clearButtonText: {
    color: "#8A2BE2",
    fontSize: 12,
    textDecorationLine: "underline",
    fontFamily: 'PixelFont',
  },
  linkText: {
    color: "#55008eff",
    marginTop: 30,
    fontSize: 10,
    textDecorationLine: "underline",
    fontFamily: 'PixelFont',
  },
  demoButton: {
    marginTop: 20,
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8A2BE2",
  },
  demoButtonText: {
    color: "#39005fff",
    fontSize: 10,
    fontFamily: 'PixelFont',
  },
});