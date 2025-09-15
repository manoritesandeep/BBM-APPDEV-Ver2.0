import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Colors } from "../../constants/styles";

function LoadingOverlay({
  message,
  size = "large",
  color = Colors.primary500,
  backgroundColor = "#fff",
  overlay = false,
  showMessage = true,
  fullScreen = true,
  style,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const containerStyle = [
    fullScreen ? styles.rootContainer : styles.inlineContainer,
    { backgroundColor },
    overlay && styles.overlay,
    style,
  ];

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      <View style={styles.contentContainer}>
        <ActivityIndicator size={size} color={color} style={styles.indicator} />
        {showMessage && message && (
          <Text style={[styles.message, { color: color }]}>{message}</Text>
        )}
      </View>
    </Animated.View>
  );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  inlineContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 120,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
});
