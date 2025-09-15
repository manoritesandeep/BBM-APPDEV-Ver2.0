import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";

const { width } = Dimensions.get("window");

function Toast({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide && onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: Colors.primary500,
          iconName: "checkmark-circle",
        };
      case "error":
        return {
          backgroundColor: Colors.accent500,
          iconName: "alert-circle",
        };
      case "warning":
        return {
          backgroundColor: "#FF9500",
          iconName: "warning",
        };
      case "info":
        return {
          backgroundColor: Colors.primary700,
          iconName: "information-circle",
        };
      default:
        return {
          backgroundColor: Colors.primary500,
          iconName: "checkmark-circle",
        };
    }
  };

  if (!visible) return null;

  const { backgroundColor, iconName } = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={hideToast}
        activeOpacity={0.8}
      >
        <Ionicons name={iconName} size={24} color={Colors.white} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={Colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Hook to manage toast state
export function useToast() {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
    duration: 3000,
  });

  const showToast = React.useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ visible: true, message, type, duration });
    },
    []
  );

  const hideToast = React.useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const ToastComponent = React.useMemo(
    () => () =>
      (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onHide={hideToast}
        />
      ),
    [toast.visible, toast.message, toast.type, toast.duration, hideToast]
  );

  return { showToast, hideToast, ToastComponent };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;
