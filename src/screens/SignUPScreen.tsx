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
import { useUser } from '../context/UserContext';

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
  background: require("../../assets/bg3.jpg"), // Adjust path as needed
};

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpNavProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { signUp, isLoading, error } = useUser();

  // Form validation
  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Please enter a username.");
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter an email address.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long.");
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return false;
    }
    
    return true;
  };

  // Handle sign-up
  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp({ username: username.trim(), email: email.trim(), password });
      
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            clearForm();
            // Navigate to Dashboard after successful signup
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              })
            );
          },
        },
      ]);
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  // Clear form
  const clearForm = () => {
    setUsername('');
    setEmail('');
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
              placeholder="Choose a username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Create a secret password (min 6 characters)"
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

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Clear form button */}
            <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
              <Text style={styles.clearButtonText}>🗑️ Clear Form</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.linkText}>Already have an account? 👋 Sign In</Text>
          </TouchableOpacity>

          {/* Quick demo button for testing */}
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => {
              setUsername('demo_user');
              setEmail('demo@example.com');
              setPassword('demo123');
              setConfirmPassword('demo123');
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
    fontSize: 48,
    fontWeight: 'bold',
    color: "#8A2BE2",
    textShadowColor: "#4B0082",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#DDA0DD",
    marginTop: 5,
    fontWeight: '600',
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
    fontSize: 26,
    fontWeight: 'bold',
    color: "#4B0082",
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: "#6A5ACD",
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  clearButtonText: {
    color: "#8A2BE2",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  linkText: {
    color: "#E0B0FF",
    marginTop: 30,
    fontSize: 16,
    textDecorationLine: "underline",
    fontWeight: '500',
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
    color: "#E0B0FF",
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 8,
    borderRadius: 5,
  },
});