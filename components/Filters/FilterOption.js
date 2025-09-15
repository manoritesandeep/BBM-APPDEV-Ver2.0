// Individual Filter Option Component - Reusable for different filter types
import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  layout,
  deviceAdjustments,
} from "../../constants/responsive";

function FilterOption({
  label,
  count,
  isActive,
  onPress,
  isMultiSelect = true,
  compactMode = false,
  disabled = false,
  customIcon = null,
  colorPreview = null,
}) {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  // Format the count display
  const formatCount = (num) => {
    if (num > 999) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Determine checkbox/radio icon
  const getSelectionIcon = () => {
    if (isMultiSelect) {
      return isActive ? "checkbox" : "square-outline";
    } else {
      return isActive ? "radio-button-on" : "radio-button-off";
    }
  };

  // Special handling for color options
  const isColorOption = colorPreview !== null;

  return (
    <Pressable
      style={[
        styles.container,
        isActive && styles.containerActive,
        disabled && styles.containerDisabled,
        compactMode && styles.containerCompact,
      ]}
      onPress={handlePress}
      disabled={disabled}
      android_ripple={{
        color: isActive ? Colors.accent300 : Colors.accent200,
        borderless: false,
      }}
    >
      {/* Selection Indicator */}
      <View
        style={[
          styles.selectionContainer,
          isActive && styles.selectionContainerActive,
        ]}
      >
        {customIcon ? (
          <Ionicons
            name={customIcon}
            size={iconSizes.sm}
            color={isActive ? Colors.white : Colors.accent600}
          />
        ) : (
          <Ionicons
            name={getSelectionIcon()}
            size={iconSizes.sm}
            color={isActive ? Colors.white : Colors.accent600}
          />
        )}
      </View>

      {/* Color Preview (for color filters) */}
      {isColorOption && (
        <View
          style={[styles.colorPreview, { backgroundColor: colorPreview }]}
        />
      )}

      {/* Label and Count */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            isActive && styles.labelActive,
            disabled && styles.labelDisabled,
            compactMode && styles.labelCompact,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>

        {count !== undefined && count > 0 && (
          <Text
            style={[
              styles.count,
              isActive && styles.countActive,
              compactMode && styles.countCompact,
            ]}
          >
            ({formatCount(count)})
          </Text>
        )}
      </View>

      {/* Active Indicator */}
      {isActive && (
        <View style={styles.activeIndicator}>
          <Ionicons
            name="checkmark"
            size={iconSizes.xs}
            color={Colors.accent600}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: deviceAdjustments.minTouchTarget * 0.75,
  },
  containerActive: {
    backgroundColor: Colors.accent50,
    borderColor: Colors.accent300,
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent500,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  containerDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray300,
    opacity: 0.6,
  },
  containerCompact: {
    paddingVertical: spacing.xs,
    minHeight: deviceAdjustments.minTouchTarget * 0.6,
  },
  selectionContainer: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(4),
    backgroundColor: Colors.gray200,
    ...layout.center,
    marginRight: spacing.sm,
  },
  selectionContainerActive: {
    backgroundColor: Colors.accent600,
  },
  colorPreview: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  labelContainer: {
    flex: 1,
    ...layout.flexRow,
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...typography.bodySmall,
    color: Colors.gray800,
    fontWeight: "500",
    flex: 1,
    marginRight: spacing.sm,
  },
  labelActive: {
    color: Colors.accent700,
    fontWeight: "600",
  },
  labelDisabled: {
    color: Colors.gray500,
  },
  labelCompact: {
    ...typography.captionMedium,
  },
  count: {
    ...typography.captionSmall,
    color: Colors.gray600,
    fontWeight: "500",
    backgroundColor: Colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(10),
    minWidth: scaleSize(28),
    textAlign: "center",
  },
  countActive: {
    backgroundColor: Colors.accent100,
    color: Colors.accent700,
    fontWeight: "600",
  },
  countCompact: {
    ...typography.captionSmall,
    paddingHorizontal: spacing.xs,
    minWidth: scaleSize(24),
  },
  activeIndicator: {
    backgroundColor: Colors.accent100,
    borderRadius: scaleSize(8),
    padding: spacing.xs / 2,
    marginLeft: spacing.sm,
  },
});

export default React.memo(FilterOption);
