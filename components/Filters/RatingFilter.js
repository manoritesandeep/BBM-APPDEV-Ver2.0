// Rating Filter Component - Specialized for rating filtering
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  layout,
} from "../../constants/responsive";

function RatingFilter({
  options,
  counts,
  activeValues,
  onFilterUpdate,
  filterType,
}) {
  if (!options || options.length === 0) return null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={iconSizes.xs}
          color={i <= rating ? "#FFD700" : Colors.gray400}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const count = counts[option.value] || 0;
        const isActive = activeValues.includes(option.value);

        // Skip ratings with no products
        if (count === 0) return null;

        return (
          <Pressable
            key={`${option.value}-${index}`}
            style={[styles.ratingOption, isActive && styles.ratingOptionActive]}
            onPress={() => onFilterUpdate(filterType, option.value)}
            android_ripple={{
              color: isActive ? Colors.accent300 : Colors.accent200,
              borderless: false,
            }}
          >
            {/* Selection Indicator */}
            <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
              <Ionicons
                name={isActive ? "checkbox" : "square-outline"}
                size={iconSizes.sm}
                color={isActive ? Colors.white : Colors.accent600}
              />
            </View>

            {/* Stars */}
            <View style={styles.starsContainer}>
              {renderStars(option.value)}
            </View>

            {/* Label and Count */}
            <View style={styles.labelContainer}>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {option.label}
              </Text>

              <Text style={[styles.count, isActive && styles.countActive]}>
                ({count})
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  ratingOption: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ratingOptionActive: {
    backgroundColor: Colors.accent50,
    borderColor: Colors.accent300,
  },
  checkbox: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(4),
    backgroundColor: Colors.gray200,
    ...layout.center,
    marginRight: spacing.sm,
  },
  checkboxActive: {
    backgroundColor: Colors.accent600,
  },
  starsContainer: {
    ...layout.flexRow,
    marginRight: spacing.sm,
    gap: spacing.xs / 2,
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
  },
  labelActive: {
    color: Colors.accent700,
    fontWeight: "600",
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
});

export default React.memo(RatingFilter);
