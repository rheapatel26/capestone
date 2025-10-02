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
// import { Video } from "expo-av";
import { Video, ResizeMode } from 'expo-av';

// import { Video, ResizeMode } from 'expo-av';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

// Define the types for your authentication stack
type AuthStackParamList = {
  SignIn: undefined;
  SignUP: undefined;
};

type SignInNavProp = NativeStackNavigationProp<AuthStackParamList, "SignIn">;

const ASSETS = {
  background: require("../../assets/bg3_temp.mp4"), // Adjust path as needed
};
const videoSource = '../../assets/bg3_temp.mp4';

export default function SignInScreen() {
  const navigation = useNavigation<SignInNavProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  //use updated expo-video instead of deprecated expo-av
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const videoRef = useRef<Video>(null);

  const handleSignIn = () => {
    console.log("Signing in with:", email, password);
    Alert.alert("Sign In", "Sign in functionality not yet implemented.");
  };

  return (
    <View style={styles.container}>
      {/* Background Video - deprecated expo-av*/}
      <Video
        ref={videoRef}
        source={ASSETS.background}
        style={StyleSheet.absoluteFillObject} // makes it full screen
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      {/* <VideoView style={StyleSheet.absoluteFillObject} player={player}/> */}

      {/* Overlay content */}
      {/* <Text style={styles.title}>MATH.IO</Text>
      <Text style={styles.subtitle}>LEARN. PLAY. CHALLENGE</Text> */}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
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
  },
  linkText: {
    color: "#E0B0FF",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
