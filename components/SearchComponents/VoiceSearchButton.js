import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Vibration,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice";

import { Colors } from "../../constants/styles";
import { iconSizes, scaleSize } from "../../constants/responsive";

const VoiceSearchButton = ({
  onSpeechResult,
  onSpeechStart,
  onSpeechEnd,
  onError,
  disabled = false,
  style,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [hasDetectedSpeech, setHasDetectedSpeech] = useState(false);
  const [lastFinalResult, setLastFinalResult] = useState("");

  // Component instance ID for debugging
  const instanceId = useRef(Math.random().toString(36).substr(2, 9)).current;

  // Cleanup flag to prevent race conditions
  const isCleaningUpRef = useRef(false);

  // Stable listening state ref to prevent re-render issues
  const actuallyListeningRef = useRef(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Timeout refs
  const speechTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const noSpeechTimeoutRef = useRef(null);

  // Initialize voice recognition and listeners with enhanced cleanup
  useEffect(() => {
    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechEnd = handleSpeechEnd;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechPartialResults = handleSpeechPartialResults;
    Voice.onSpeechVolumeChanged = handleSpeechVolumeChanged;

    checkPermissions();

    return () => {
      clearAllTimeouts();
      // Enhanced cleanup to prevent audio conflicts
      Voice.destroy()
        .then(() => {
          return Voice.removeAllListeners();
        })
        .catch((error) => {
          console.warn("Warning during Voice cleanup:", error);
        });
    };
  }, []);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    [speechTimeoutRef, silenceTimeoutRef, noSpeechTimeoutRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  }, []);

  // Stable listening state management to prevent re-render issues
  const setListeningState = useCallback(
    (listening) => {
      const currentState = actuallyListeningRef.current;

      // Prevent unnecessary state changes
      if (currentState === listening) {
        return;
      }

      actuallyListeningRef.current = listening;
      setIsListening(listening);
    },
    [instanceId]
  );

  // Check microphone permissions
  const checkPermissions = async () => {
    try {
      const available = await Voice.isAvailable();
      setHasPermission(available);
    } catch (error) {
      console.warn("Voice permission check failed:", error);
      setHasPermission(false);
    }
  };

  // Enhanced visual feedback animations
  const startEnhancedAnimations = useCallback(() => {
    // Immediate scale feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple effect (faster for instant response)
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 200, // Reduced from 600ms to 200ms for faster ripple
      useNativeDriver: true,
    }).start();

    // Continuous pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    // Opacity breathing effect
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    opacityLoop.start();
  }, [pulseAnim, scaleAnim, opacityAnim, rippleAnim]);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    [pulseAnim, scaleAnim, opacityAnim, rippleAnim].forEach((anim) => {
      anim.stopAnimation();
    });

    Animated.parallel([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim, scaleAnim, opacityAnim]);

  // Effect to ensure animations are properly cleaned up when isListening changes
  useEffect(() => {
    if (!isListening && !actuallyListeningRef.current) {
      stopAllAnimations();
    }
  }, [isListening, stopAllAnimations]);

  // Enhanced voice event handlers
  const handleSpeechStart = useCallback(() => {
    // Prevent race condition - don't start if we're cleaning up
    if (isCleaningUpRef.current) {
      return;
    }

    // Additional check - don't start if we're already actually listening
    if (actuallyListeningRef.current) {
      return;
    }

    setListeningState(true);
    startEnhancedAnimations();
    onSpeechStart?.();

    // Enhanced haptic feedback - using native Vibration API
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Vibration.vibrate(50);
    }

    // Setup enhanced timeouts
    speechTimeoutRef.current = setTimeout(() => {
      stopListening("session_timeout");
    }, 30000);

    noSpeechTimeoutRef.current = setTimeout(() => {
      if (!hasDetectedSpeech) {
        stopListening("no_speech_detected");
      }
    }, 4000);
  }, [
    setListeningState,
    startEnhancedAnimations,
    hasDetectedSpeech,
    onSpeechStart,
  ]);

  const handleSpeechEnd = useCallback(() => {
    // Set cleanup flag to prevent race conditions
    isCleaningUpRef.current = true;

    // Force immediate state reset using stable state management
    setListeningState(false);
    setHasDetectedSpeech(false);

    // Use setImmediate to ensure state update happens before animation cleanup
    setImmediate(() => {
      stopAllAnimations();

      // Reset cleanup flag immediately for instant response
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 10); // Reduced from 50ms to 10ms for instant reset
    });

    clearAllTimeouts();
    onSpeechEnd?.();
  }, [setListeningState, stopAllAnimations, clearAllTimeouts, onSpeechEnd]);

  const handleSpeechError = useCallback(
    (error) => {
      console.warn("Speech error:", error);

      // Reset cleanup flag on error
      isCleaningUpRef.current = false;

      setListeningState(false);
      setHasDetectedSpeech(false);
      stopAllAnimations();
      clearAllTimeouts();

      // Enhanced error handling with graceful UX
      if (error.error?.code === "permissions") {
        Alert.alert(
          "Microphone Permission Required",
          "Please enable microphone access in settings to use voice search.",
          [{ text: "OK", style: "default" }]
        );
      } else if (
        error.error?.code === "no_speech" ||
        error.error?.code === "recognition_fail"
      ) {
        // Silent handling for no speech - more graceful UX
        // Softer haptic feedback for no speech (not an error from user perspective)
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Vibration.vibrate(30); // Gentle single vibration
        }
      } else {
        onError?.(error);
        // Error haptic feedback for actual errors
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Vibration.vibrate([50, 50, 50]); // Triple vibration for real errors
        }
      }
    },
    [setListeningState, stopAllAnimations, clearAllTimeouts, onError]
  );

  const handleSpeechResults = useCallback(
    (result) => {
      if (result.value && result.value.length > 0) {
        const speechText = result.value[0];

        // Prevent duplicate final results
        if (speechText === lastFinalResult) {
          return;
        }

        setLastFinalResult(speechText);
        setHasDetectedSpeech(true);
        onSpeechResult?.(speechText, false);

        // Success haptic feedback - using native Vibration API
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Vibration.vibrate(100); // Single longer vibration for success
        }

        // Immediately stop listening after final result
        stopListening("speech_completed");
      }
    },
    [lastFinalResult, onSpeechResult, stopListening]
  );

  const handleSpeechPartialResults = useCallback(
    (result) => {
      if (result.value && result.value.length > 0) {
        const speechText = result.value[0];
        setHasDetectedSpeech(true);
        onSpeechResult?.(speechText, true);

        // Reset silence timeout on speech detection
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }

        // Enhanced auto-stop: 2 seconds after last speech (reduced from 3 seconds)
        silenceTimeoutRef.current = setTimeout(() => {
          if (isListening) {
            stopListening("silence_detected");
          }
        }, 2000);

        // Clear no-speech timeout since we detected speech
        if (noSpeechTimeoutRef.current) {
          clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = null;
        }
      }
    },
    [isListening, onSpeechResult, stopListening]
  );

  const handleSpeechVolumeChanged = useCallback(
    (event) => {
      // Volume monitoring for future features (silent for now)
    },
    [isListening]
  );

  // Enhanced start listening with crash prevention
  const startListening = useCallback(async () => {
    if (disabled || isListening) return;

    try {
      // Reset cleanup flag when starting new session
      isCleaningUpRef.current = false;

      // Always check availability and stop any existing sessions first
      const available = await Voice.isAvailable();
      if (!available) {
        Alert.alert(
          "Voice Recognition Unavailable",
          "Voice recognition is not available on this device.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      // Critical: Stop any existing Voice session before starting new one
      try {
        await Voice.stop();
        await Voice.cancel();
      } catch (stopError) {
        console.warn(
          "Warning: Could not stop existing voice session:",
          stopError
        );
        // Continue anyway as this is expected if no session was active
      }

      // Small delay to ensure cleanup completes (reduced for faster response)
      await new Promise((resolve) => setTimeout(resolve, 25)); // Reduced from 100ms to 25ms

      clearAllTimeouts();
      setHasDetectedSpeech(false);
      setLastFinalResult(""); // Reset to prevent duplicate detection across sessions
      onSpeechStart?.();

      // Start with enhanced options to prevent audio conflicts
      await Voice.start("en-US", {
        EXTRA_LANGUAGE_MODEL: "LANGUAGE_MODEL_FREE_FORM",
        EXTRA_CALLING_PACKAGE: "com.noobdevtest.buildbharatmart.iOS",
        EXTRA_PARTIAL_RESULTS: true,
        REQUEST_PERMISSIONS_AUTO: true,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
      });
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      handleSpeechError({ error });
    }
  }, [
    disabled,
    isListening,
    clearAllTimeouts,
    onSpeechStart,
    handleSpeechError,
  ]);

  // Enhanced stop listening with reason and crash prevention
  const stopListening = useCallback(
    async (reason = "manual") => {
      try {
        // Clear all timeouts first
        clearAllTimeouts();

        // Critical: Always try to stop voice properly to prevent audio conflicts
        try {
          await Voice.stop();
        } catch (stopError) {
          console.warn("Warning during Voice.stop:", stopError);
          // Try cancel as fallback
          try {
            await Voice.cancel();
          } catch (cancelError) {
            console.warn("Warning during Voice.cancel:", cancelError);
          }
        }

        // Small delay before re-initializing to ensure cleanup
        setTimeout(() => {
          try {
            Voice.onSpeechStart = handleSpeechStart;
            Voice.onSpeechEnd = handleSpeechEnd;
            Voice.onSpeechError = handleSpeechError;
            Voice.onSpeechResults = handleSpeechResults;
            Voice.onSpeechPartialResults = handleSpeechPartialResults;
            Voice.onSpeechVolumeChanged = handleSpeechVolumeChanged;
          } catch (listenerError) {
            console.warn("Warning setting up voice listeners:", listenerError);
          }
        }, 150);

        // Reason-based haptic feedback - using native Vibration API
        if (Platform.OS === "ios" || Platform.OS === "android") {
          switch (reason) {
            case "silence_detected":
            case "session_timeout":
              Vibration.vibrate(30); // Light vibration
              break;
            case "no_speech_detected":
              Vibration.vibrate([50, 50, 50]); // Warning pattern
              break;
            default:
              Vibration.vibrate(50); // Medium vibration
          }
        }
      } catch (error) {
        console.warn("Error stopping voice recognition:", error);
      }
    },
    [
      clearAllTimeouts,
      handleSpeechStart,
      handleSpeechEnd,
      handleSpeechError,
      handleSpeechResults,
      handleSpeechPartialResults,
      handleSpeechVolumeChanged,
    ]
  );

  // Handle button press
  const handlePress = useCallback(() => {
    if (isListening) {
      stopListening("user_stopped");
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Get appropriate icon and color
  const getMicIconName = () => {
    // Use ref state for more stable reading during re-renders
    const actuallyListening = actuallyListeningRef.current;
    const iconName = actuallyListening
      ? "mic"
      : hasPermission === false
      ? "mic-off"
      : "mic-outline";
    return iconName;
  };

  const getMicIconColor = () => {
    // Use ref state for more stable reading during re-renders
    const actuallyListening = actuallyListeningRef.current;
    let color;
    if (disabled) color = Colors.gray400;
    else if (actuallyListening) color = Colors.error500;
    else if (hasPermission === false) color = Colors.gray400;
    else color = Colors.gray600;

    return color;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Multi-layer pulse background for enhanced feedback */}
      {isListening && (
        <>
          <Animated.View
            style={[
              styles.pulseBackground,
              styles.pulseOuter,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseBackground,
              styles.pulseMiddle,
              {
                transform: [{ scale: Animated.multiply(pulseAnim, 0.7) }],
                opacity: Animated.multiply(opacityAnim, 1.5),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseBackground,
              styles.pulseInner,
              {
                transform: [{ scale: Animated.multiply(pulseAnim, 0.4) }],
                opacity: Animated.multiply(opacityAnim, 2),
              },
            ]}
          />

          {/* Ripple effect for start feedback */}
          <Animated.View
            style={[
              styles.rippleEffect,
              {
                transform: [{ scale: rippleAnim }],
                opacity: Animated.subtract(1, rippleAnim),
              },
            ]}
          />
        </>
      )}

      <Pressable
        onPress={handlePress}
        disabled={disabled || hasPermission === false}
        style={({ pressed }) => [
          styles.button,
          pressed && !disabled && styles.buttonPressed,
          disabled && styles.buttonDisabled,
          isListening && styles.buttonListening,
        ]}
        android_ripple={{
          color: Colors.accent500 + "20",
          radius: iconSizes.lg,
        }}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons
            name={getMicIconName()}
            size={iconSizes.md}
            color={getMicIconColor()}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: iconSizes.lg + scaleSize(2),
    height: iconSizes.lg + scaleSize(2),
    justifyContent: "center",
    alignItems: "center",
  },
  pulseBackground: {
    position: "absolute",
    borderRadius: (iconSizes.lg + scaleSize(2)) / 2,
    backgroundColor: Colors.error500,
  },
  pulseOuter: {
    width: iconSizes.lg + scaleSize(8),
    height: iconSizes.lg + scaleSize(8),
  },
  pulseMiddle: {
    width: iconSizes.lg + scaleSize(5),
    height: iconSizes.lg + scaleSize(5),
  },
  pulseInner: {
    width: iconSizes.lg + scaleSize(3),
    height: iconSizes.lg + scaleSize(3),
  },
  rippleEffect: {
    position: "absolute",
    width: iconSizes.lg + scaleSize(12),
    height: iconSizes.lg + scaleSize(12),
    borderRadius: (iconSizes.lg + scaleSize(12)) / 2,
    backgroundColor: Colors.error500,
  },
  button: {
    width: iconSizes.lg + scaleSize(2),
    height: iconSizes.lg + scaleSize(2),
    borderRadius: (iconSizes.lg + scaleSize(2)) / 2,
    backgroundColor: Colors.gray50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
    zIndex: 10,
  },
  buttonPressed: {
    backgroundColor: Colors.gray100,
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    backgroundColor: Colors.gray100,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonListening: {
    backgroundColor: Colors.error50,
    borderColor: Colors.error200,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VoiceSearchButton;
