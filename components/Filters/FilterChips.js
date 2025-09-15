// Filter Chips Component - Shows active filters as removable chips
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  layout,
} from "../../constants/responsive";

function FilterChips({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  filterConfigs,
  style,
}) {
  // Convert active filters to chip data
  const chips = [];

  Object.entries(activeFilters).forEach(([filterType, values]) => {
    if (!values || values.length === 0) return;

    const config = filterConfigs[filterType];
    if (!config) return;

    values.forEach((value) => {
      // Format display label based on filter type
      let displayLabel = value;

      switch (filterType) {
        case "rating":
          displayLabel = `${value}+ Stars`;
          break;
        case "discount":
          displayLabel = `${value}% off`;
          break;
        case "availability":
          const availabilityLabels = {
            inStock: "In Stock",
            lowStock: "Low Stock",
            outOfStock: "Out of Stock",
          };
          displayLabel = availabilityLabels[value] || value;
          break;
        case "rentable":
          displayLabel = value ? "Rentable" : "Purchase Only";
          break;
        case "priceRange":
          displayLabel = value; // Already formatted in context
          break;
        default:
          displayLabel = value;
      }

      chips.push({
        filterType,
        value,
        displayLabel,
        icon: config.icon,
        category: config.label,
      });
    });
  });

  if (chips.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Active Filters</Text>
        {chips.length > 1 && (
          <Pressable
            style={styles.clearAllButton}
            onPress={onClearAll}
            android_ripple={{ color: Colors.error200, borderless: true }}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.scrollView}
      >
        {chips.map((chip, index) => (
          <Pressable
            key={`${chip.filterType}-${chip.value}-${index}`}
            style={styles.chip}
            onPress={() => onRemoveFilter(chip.filterType, chip.value)}
            android_ripple={{ color: Colors.accent300, borderless: false }}
          >
            <View style={styles.chipIconContainer}>
              <Ionicons
                name={chip.icon}
                size={iconSizes.xs}
                color={Colors.accent600}
              />
            </View>

            <Text style={styles.chipLabel} numberOfLines={1}>
              {chip.displayLabel}
            </Text>

            <View style={styles.removeButton}>
              <Ionicons
                name="close"
                size={iconSizes.xs}
                color={Colors.accent600}
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray800,
  },
  clearAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: scaleSize(6),
    backgroundColor: Colors.error100,
  },
  clearAllText: {
    ...typography.captionMedium,
    color: Colors.error700,
    fontWeight: "600",
  },
  scrollView: {
    flexGrow: 0,
  },
  chipsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.md, // Extra padding for last chip
  },
  chip: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.accent100,
    borderRadius: scaleSize(20),
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent200,
    maxWidth: scaleSize(120), // Prevent chips from being too wide
  },
  chipIconContainer: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.accent200,
    ...layout.center,
    marginRight: spacing.xs,
  },
  chipLabel: {
    ...typography.captionMedium,
    color: Colors.accent700,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.xs,
  },
  removeButton: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.accent200,
    ...layout.center,
  },
});

export default React.memo(FilterChips);
