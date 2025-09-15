import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  Text,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../constants/styles";
import { useI18n } from "../../store/i18n-context";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  iconSizes,
} from "../../constants/responsive";
import VoiceSearchButton from "./VoiceSearchButton";

// Global voice state manager to prevent multiple component desync
const VoiceStateManager = {
  activeComponents: new Set(),
  isGlobalVoiceActive: false,

  register(componentId) {
    this.activeComponents.add(componentId);
  },

  unregister(componentId) {
    this.activeComponents.delete(componentId);
  },

  setGlobalVoiceState(isActive) {
    this.isGlobalVoiceActive = isActive;
    // Notify all active components to sync their state
    this.activeComponents.forEach((id) => {
      if (window.voiceStateCallbacks && window.voiceStateCallbacks[id]) {
        window.voiceStateCallbacks[id](isActive);
      }
    });
  },

  getGlobalVoiceState() {
    return this.isGlobalVoiceActive;
  },
};

// Global callback registry
if (typeof window !== "undefined") {
  window.voiceStateCallbacks = window.voiceStateCallbacks || {};
}

function EnhancedSearchBar({
  placeholder = "Search products...",
  onSearchChange,
  onFocus,
  onBlur,
  onClear,
  value = "",
  style,
  debounceMs = 600,
  autoFocus = false,
  enableVoiceSearch = true,
  voiceSearchPlaceholder = "🎤 Listening...",
}) {
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(""); // "starting", "listening", "processing", ""

  // Local input state to allow debounced searches while still reflecting typed text
  const [localValue, setLocalValue] = useState(value);

  const componentId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const debounceTimer = useRef(null);
  const animatedValue = useRef(null);
  const voiceAnimatedValue = useRef(null);
  const voicePulseAnim = useRef(null);
  const inputRef = useRef(null);
  const voiceTextRef = useRef("");
  const isMountedRef = useRef(true);
  const voiceTimeoutRef = useRef(null);
  const forceResetTimeoutRef = useRef(null); // For immediate force reset

  // Lazy initialize animated values to avoid insertion effect issues
  const getAnimatedValue = () => {
    if (!animatedValue.current) {
      animatedValue.current = new Animated.Value(0);
    }
    return animatedValue.current;
  };

  const getVoiceAnimatedValue = () => {
    if (!voiceAnimatedValue.current) {
      voiceAnimatedValue.current = new Animated.Value(0);
    }
    return voiceAnimatedValue.current;
  };

  const getVoicePulseAnim = () => {
    if (!voicePulseAnim.current) {
      voicePulseAnim.current = new Animated.Value(1);
    }
    return voicePulseAnim.current;
  };

  // Safe state setter that defers updates to the next macrotask to avoid
  // scheduling updates during React's insertion phase. We track timeouts
  // so they can be cleared on unmount.
  const pendingTimeoutsRef = useRef([]);
  const safeSetState = useCallback((setter) => {
    const t = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          setter();
        } catch (e) {
          // swallow to avoid interfering with React internals
          console.warn("safeSetState error", e);
        }
      }
    }, 0);
    pendingTimeoutsRef.current.push(t);
  }, []);

  // Start pulse animation when voice is active
  useEffect(() => {
    if (isVoiceActive) {
      const pulseAnim = getVoicePulseAnim();
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    } else {
      // Reset animation when not active
      if (voicePulseAnim.current) {
        voicePulseAnim.current.setValue(1);
      }
    }
  }, [isVoiceActive]);

  // Safety cleanup effect - ensures voice states are reset after timeout (reduced timeout)
  useEffect(() => {
    // Set up a safety timer to force cleanup voice states if they're stuck
    const safetyTimer = setTimeout(() => {
      if (isVoiceActive && isMountedRef.current) {
        safeSetState(() => {
          setIsVoiceActive(false);
          setIsVoiceTyping(false);
          setVoiceStatus("");
        });
        // Clear any pending timeouts
        if (voiceTimeoutRef.current) {
          clearTimeout(voiceTimeoutRef.current);
          voiceTimeoutRef.current = null;
        }
      }
    }, 3000); // Reduced to 3 second safety timeout for faster recovery

    return () => clearTimeout(safetyTimer);
  }, [isVoiceActive]); // Re-run when isVoiceActive changes

  // Component registration and global state sync
  useEffect(() => {
    // Register this component with the global voice state manager
    VoiceStateManager.register(componentId);

    // Set up callback for global state sync
    if (typeof window !== "undefined" && window.voiceStateCallbacks) {
      window.voiceStateCallbacks[componentId] = (globalVoiceState) => {
        if (isMountedRef.current && isVoiceActive !== globalVoiceState) {
          safeSetState(() => {
            setIsVoiceActive(globalVoiceState);
            if (!globalVoiceState) {
              setIsVoiceTyping(false);
              setVoiceStatus("");
            }
          });
        }
      };
    }

    return () => {
      VoiceStateManager.unregister(componentId);
      if (typeof window !== "undefined" && window.voiceStateCallbacks) {
        delete window.voiceStateCallbacks[componentId];
      }
    };
  }, [componentId, isVoiceActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      if (forceResetTimeoutRef.current) {
        clearTimeout(forceResetTimeoutRef.current);
      }
      // clear any deferred safeSetState timeouts
      (pendingTimeoutsRef.current || []).forEach((id) => clearTimeout(id));
      pendingTimeoutsRef.current = [];
    };
  }, []);

  // Debounced search function with safety checks
  const debouncedSearch = useCallback(
    (text) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        // Only call if component is still mounted and callback exists
        if (onSearchChange && debounceTimer.current) {
          onSearchChange(text);
        }
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  // Keep localValue in sync when parent updates `value` prop (e.g., external clears)
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleTextChange = (text) => {
    // Update visible input immediately
    setLocalValue(text);

    // Debounce calling the search handler so search only starts after user pauses
    debouncedSearch(text);

    // Reset voice state when user types manually
    if (text !== voiceTextRef.current) {
      safeSetState(() => {
        setIsVoiceTyping(false);
        setVoiceStatus("");
      });
      voiceTextRef.current = "";
    }
  };
  const handleFocus = () => {
    safeSetState(() => setIsFocused(true));
    onFocus?.();

    Animated.timing(getAnimatedValue(), {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    safeSetState(() => setIsFocused(false));
    onBlur?.();

    Animated.timing(getAnimatedValue(), {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    voiceTextRef.current = "";
    setLocalValue("");
    safeSetState(() => {
      setIsVoiceTyping(false);
      setVoiceStatus("");
    });

    // Clear immediately, not debounced
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onSearchChange?.("");
    onClear?.();
    inputRef.current?.focus();
  };

  // Voice search handlers with improved feedback and duplicate prevention
  const handleVoiceSearchStart = () => {
    // Update global state immediately
    VoiceStateManager.setGlobalVoiceState(true);

    // Clear any existing timeouts first (important for consecutive searches)
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }

    // Force reset all voice states to ensure clean start
    safeSetState(() => {
      setIsVoiceActive(true);
      setIsVoiceTyping(false);
      setVoiceStatus("starting");
    });
    voiceTextRef.current = "";

    // Focus input and show voice feedback
    inputRef.current?.focus();

    // Haptic feedback to indicate start
    if (Platform.OS === "ios") {
      Vibration.vibrate(50);
    }

    // Update status to listening after short delay (instant response)
    voiceTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        safeSetState(() => setVoiceStatus("listening"));
      }
    }, 10); // Reduced from 100ms to 10ms for near-instant response

    Animated.timing(getVoiceAnimatedValue(), {
      toValue: 1,
      duration: 50, // Reduced from 100ms to 50ms for faster start
      useNativeDriver: false,
    }).start();
  };

  const handleVoiceSearchEnd = () => {
    // Update global state immediately
    VoiceStateManager.setGlobalVoiceState(false);

    // Clear ALL timeouts FIRST to prevent any delayed state changes
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
    if (forceResetTimeoutRef.current) {
      clearTimeout(forceResetTimeoutRef.current);
      forceResetTimeoutRef.current = null;
    }

    // Reset voice text ref
    voiceTextRef.current = "";

    // IMMEDIATE state reset - no delays
    safeSetState(() => {
      setIsVoiceActive(false);
      setIsVoiceTyping(false);
      setVoiceStatus("");
    });

    // Reset voice animation (ultra-fast for instant UX)
    Animated.timing(getVoiceAnimatedValue(), {
      toValue: 0,
      duration: 25, // Reduced from 100ms to 25ms for instant reset
      useNativeDriver: false,
    }).start();

    // Force immediate reset as backup (prevents stuck states)
    forceResetTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        safeSetState(() => {
          setIsVoiceActive(false);
          setIsVoiceTyping(false);
          setVoiceStatus("");
        });
      }
    }, 100); // Quick backup to ensure reset happens
  };
  const handleVoiceResult = (speechText, isPartial = false) => {
    if (speechText && speechText.trim()) {
      const trimmedText = speechText.trim();

      // Prevent duplicate processing of the same result
      if (voiceTextRef.current === trimmedText && !isPartial) {
        return;
      }

      voiceTextRef.current = trimmedText;

      // For voice results, update visible input and parent immediately
      setLocalValue(trimmedText);
      onSearchChange?.(trimmedText);

      safeSetState(() => {
        setIsVoiceTyping(true);
        setVoiceStatus(isPartial ? "listening" : "processing");
      });

      // For final results, DO NOT set timeout for status clearing
      // Let handleVoiceSearchEnd handle the cleanup instead
      if (!isPartial) {
        // Clear any existing timeout to prevent conflicts
        if (voiceTimeoutRef.current) {
          clearTimeout(voiceTimeoutRef.current);
          voiceTimeoutRef.current = null;
        }
      }
    }
  };

  const handleVoiceError = (error) => {
    // Clear any pending timeouts
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }

    safeSetState(() => {
      setIsVoiceActive(false);
      setIsVoiceTyping(false);
      setVoiceStatus("");
    });

    Animated.timing(getVoiceAnimatedValue(), {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Animation interpolations
  const animatedBorderColor = getAnimatedValue().interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderLight, Colors.accent500],
  });

  const voiceAnimatedBorderColor = getVoiceAnimatedValue().interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderLight, Colors.error500],
  });

  const voiceAnimatedBackgroundColor = getVoiceAnimatedValue().interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 1)", "rgba(239, 68, 68, 0.05)"],
  });

  // Determine which border color to use
  const currentBorderColor = isVoiceActive
    ? voiceAnimatedBorderColor
    : animatedBorderColor;
  const currentBackgroundColor = isVoiceActive
    ? voiceAnimatedBackgroundColor
    : "#fff";

  const getPlaceholderText = () => {
    if (isVoiceActive) {
      switch (voiceStatus) {
        case "starting":
          return `🎤 ${t("search.voiceStarting")}`;
        case "listening":
          return `🎤 ${t("search.voiceListening")}`;
        case "processing":
          return `🔄 ${t("search.voiceProcessing")}`;
        default:
          return `🎤 ${t("search.voiceListening")}`;
      }
    }
    return t("search.placeholder");
  };

  const getPlaceholderColor = () => {
    if (isVoiceActive) {
      return Colors.error500 + "80";
    }
    return Colors.gray500;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: currentBorderColor,
          backgroundColor: currentBackgroundColor,
        },
        style,
      ]}
    >
      {/* Search Icon */}
      <Animated.View
        style={[
          styles.searchIconContainer,
          isVoiceActive && { transform: [{ scale: getVoicePulseAnim() }] },
        ]}
      >
        <Ionicons
          name="search"
          size={iconSizes.md}
          color={
            isVoiceActive
              ? Colors.error500
              : isFocused
              ? Colors.accent500
              : Colors.gray700
          }
          style={styles.searchIcon}
        />
      </Animated.View>

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        style={[styles.input, isVoiceTyping && styles.inputVoiceTyping]}
        placeholder={getPlaceholderText()}
        placeholderTextColor={getPlaceholderColor()}
        value={localValue}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={() => {
          // Immediately run search when user submits
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
          }
          onSearchChange?.(localValue);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        allowFontScaling={true}
        editable={!isVoiceActive} // Disable editing during voice input
      />

      {/* Voice Status Indicator */}
      {isVoiceActive && voiceStatus && (
        <View style={styles.voiceIndicator}>
          <Animated.View
            style={[
              styles.voiceIndicatorDot,
              { transform: [{ scale: getVoicePulseAnim() }] },
            ]}
          />
          <Text style={styles.voiceIndicatorText}>
            {voiceStatus === "starting" && "Starting"}
            {voiceStatus === "listening" && "Listening"}
            {voiceStatus === "processing" && "Processing"}
          </Text>
        </View>
      )}

      {/* Action Buttons Container */}
      <View style={styles.actionsContainer}>
        {/* Clear Button */}
        {value && value.length > 0 && !isVoiceActive && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={iconSizes.md}
              color={Colors.gray500}
            />
          </Pressable>
        )}

        {/* Voice Search Button */}
        {enableVoiceSearch && (
          <VoiceSearchButton
            onSpeechResult={handleVoiceResult}
            onSpeechStart={handleVoiceSearchStart}
            onSpeechEnd={handleVoiceSearchEnd}
            onError={handleVoiceError}
            disabled={false}
            style={styles.voiceButton}
          />
        )}
      </View>
    </Animated.View>
  );
}

export default React.memo(EnhancedSearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scaleSize(25),
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : scaleVertical(4),
    marginHorizontal: spacing.sm,
    marginBottom: Platform.OS === "ios" ? spacing.xs : 0,
    minHeight: scaleSize(24),
    ...deviceAdjustments.shadow,
  },
  searchIconContainer: {
    marginRight: spacing.sm,
  },
  searchIcon: {
    // Icon styles handled by parent container animation
  },
  input: {
    flex: 1,
    ...typography.body,
    color: Colors.accent500,
    paddingVertical: 0,
    minHeight: scaleSize(24),
  },
  inputVoiceTyping: {
    color: Colors.error500,
    fontWeight: "500",
  },
  voiceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: scaleSize(12),
    backgroundColor: Colors.error500 + "10",
  },
  voiceIndicatorDot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
    backgroundColor: Colors.error500,
    marginRight: spacing.xs / 2,
  },
  voiceIndicatorText: {
    ...typography.caption,
    color: Colors.error500,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  clearButton: {
    padding: 1,
    minHeight: deviceAdjustments.minTouchTarget * 0.6,
    minWidth: deviceAdjustments.minTouchTarget * 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButton: {
    marginLeft: spacing.xs / 2,
  },
});
