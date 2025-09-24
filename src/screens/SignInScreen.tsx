import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Video, ResizeMode } from 'expo-av';
import { useUser } from '../context/UserContext';

// Define the types for your authentication stack
type AuthStackParamList = {
  SignIn: undefined;
  SignUP: undefined;
  MainTabs: undefined;
};

type SignInNavProp = NativeStackNavigationProp<AuthStackParamList, "SignIn">;

const ASSETS = {
  background: require("../../assets/bg3_temp.mp4"), // Adjust path as needed
};

export default function SignInScreen() {
  const navigation = useNavigation<SignInNavProp>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const videoRef = useRef<Video>(null);
  
  const { signIn, isLoading, error } = useUser();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await signIn({ username: username.trim(), password: password.trim() });
      // Navigate to main app on successful sign in
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      Alert.alert("Sign In Failed", "Invalid username or password");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        ref={videoRef}
        source={ASSETS.background}
        style={StyleSheet.absoluteFillObject} // makes it full screen
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Overlay content */}
      {/* <Text style={styles.title}>MATH.IO</Text>
      <Text style={styles.subtitle}>LEARN. PLAY. CHALLENGE</Text> */}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("SignUP")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 48,
    color: "#8A2BE2",
    textShadowColor: "#4B0082",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: 'PixelFont'
  },
  subtitle: {
    fontSize: 18,
    color: "#DDA0DD",
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 20,
    marginTop: 100,
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#6A5ACD",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  errorText: {
    color: "#ff4444",
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 4,
  },
  linkText: {
    color: "#E0B0FF",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
