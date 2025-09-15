// Compact Filter Bar Component - Quick access filter bar for top of product listings
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "../../store/filter-context";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  layout,
  deviceAdjustments,
} from "../../constants/responsive";

function CompactFilterBar({
  onOpenFullFilter,
  style,
  showResultsCount = true,
  showSortButton = true,
}) {
  const {
    activeFilters,
    selectedCategory,
    filteredProducts,
    appliedFiltersCount,
    suggestedFilters,
    updateFilter,
    clearFilter,
  } = useFilter();

  const [sortVisible, setSortVisible] = useState(false);

  // Quick filter options that appear in the compact bar
  const quickFilters = [
    {
      key: "rating",
      value: 4,
      label: "4+ Stars",
      icon: "star",
      color: "#FFD700",
    },
    {
      key: "discount",
      value: 20,
      label: "20% Off",
      icon: "pricetag",
      color: Colors.error500,
    },
    {
      key: "availability",
      value: "inStock",
      label: "In Stock",
      icon: "checkmark-circle",
      color: Colors.success500,
    },
  ];

  // Sort options
  const sortOptions = [
    { key: "relevance", label: "Relevance", icon: "star-outline" },
    { key: "price-low", label: "Price: Low to High", icon: "arrow-up" },
    { key: "price-high", label: "Price: High to Low", icon: "arrow-down" },
    { key: "rating", label: "Highest Rated", icon: "star" },
    { key: "newest", label: "Newest First", icon: "time" },
  ];

  const handleQuickFilterPress = (filterKey, value) => {
    const activeValues = activeFilters[filterKey] || [];
    const isActive = activeValues.includes(value);

    if (isActive) {
      // If removing this filter would clear the entire filter type, use clearFilter
      if (activeValues.length === 1) {
        clearFilter(filterKey);
      } else {
        updateFilter(filterKey, value, true);
      }
    } else {
      updateFilter(filterKey, value, true);
    }
  };

  const isQuickFilterActive = (filterKey, value) => {
    const activeValues = activeFilters[filterKey] || [];
    return activeValues.includes(value);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top Row: Results Count and Filter Button */}
      <View style={styles.topRow}>
        {showResultsCount && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {filteredProducts.length.toLocaleString()}
            </Text>
            <Text style={styles.resultsLabel}>
              {filteredProducts.length === 1 ? "product" : "products"}
            </Text>
            {selectedCategory && (
              <Text style={styles.categoryLabel}>in {selectedCategory}</Text>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          {showSortButton && (
            <Pressable
              style={[
                styles.actionButton,
                sortVisible && styles.actionButtonActive,
              ]}
              onPress={() => setSortVisible(!sortVisible)}
              android_ripple={{ color: Colors.accent200, borderless: true }}
            >
              <Ionicons
                name="swap-vertical"
                size={iconSizes.sm}
                color={sortVisible ? Colors.accent600 : Colors.gray700}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  sortVisible && styles.actionButtonTextActive,
                ]}
              >
                Sort
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.actionButton,
              styles.filterButton,
              appliedFiltersCount > 0 && styles.filterButtonActive,
            ]}
            onPress={onOpenFullFilter}
            android_ripple={{ color: Colors.accent200, borderless: true }}
          >
            <Ionicons
              name="funnel"
              size={iconSizes.sm}
              color={appliedFiltersCount > 0 ? Colors.white : Colors.gray700}
            />
            <Text
              style={[
                styles.actionButtonText,
                appliedFiltersCount > 0 && styles.filterButtonText,
              ]}
            >
              Filter
            </Text>
            {appliedFiltersCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>
                  {appliedFiltersCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Quick Filters Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContainer}
        style={styles.quickFiltersScroll}
      >
        {quickFilters.map((filter, index) => {
          const isActive = isQuickFilterActive(filter.key, filter.value);

          return (
            <Pressable
              key={`${filter.key}-${filter.value}`}
              style={[
                styles.quickFilterChip,
                isActive && [
                  styles.quickFilterChipActive,
                  { borderColor: filter.color },
                ],
              ]}
              onPress={() => handleQuickFilterPress(filter.key, filter.value)}
              android_ripple={{ color: filter.color + "30", borderless: false }}
            >
              <Ionicons
                name={filter.icon}
                size={iconSizes.xs}
                color={isActive ? filter.color : Colors.gray600}
              />
              <Text
                style={[
                  styles.quickFilterText,
                  isActive && [
                    styles.quickFilterTextActive,
                    { color: filter.color },
                  ],
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Smart Suggestions in Quick Bar */}
        {suggestedFilters.slice(0, 2).map((suggestion, index) => (
          <Pressable
            key={`suggestion-${suggestion.type}-${suggestion.value}`}
            style={[styles.quickFilterChip, styles.suggestionChip]}
            onPress={() =>
              updateFilter(suggestion.type, suggestion.value, true)
            }
            android_ripple={{ color: Colors.warning200, borderless: false }}
          >
            <Ionicons
              name="bulb"
              size={iconSizes.xs}
              color={Colors.warning600}
            />
            <Text style={[styles.quickFilterText, styles.suggestionText]}>
              {suggestion.label.split(" (")[0]} {/* Remove count from label */}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort Options (if visible) */}
      {sortVisible && (
        <Animated.View style={styles.sortContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortOptionsContainer}
          >
            {sortOptions.map((option, index) => (
              <Pressable
                key={option.key}
                style={styles.sortOption}
                onPress={() => {
                  // Handle sort logic here
                  setSortVisible(false);
                }}
                android_ripple={{ color: Colors.accent200, borderless: false }}
              >
                <Ionicons
                  name={option.icon}
                  size={iconSizes.xs}
                  color={Colors.accent600}
                />
                <Text style={styles.sortOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: spacing.sm,
  },
  topRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  resultsContainer: {
    ...layout.flexRow,
    alignItems: "baseline",
    flex: 1,
  },
  resultsCount: {
    ...typography.h6,
    fontWeight: "700",
    color: Colors.gray900,
    marginRight: spacing.xs,
  },
  resultsLabel: {
    ...typography.bodySmall,
    color: Colors.gray600,
    marginRight: spacing.xs,
  },
  categoryLabel: {
    ...typography.captionMedium,
    color: Colors.accent600,
    fontWeight: "600",
  },
  actionButtons: {
    ...layout.flexRow,
    gap: spacing.sm,
  },
  actionButton: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: scaleSize(20),
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: spacing.xs,
  },
  actionButtonActive: {
    backgroundColor: Colors.accent100,
    borderColor: Colors.accent300,
  },
  actionButtonText: {
    ...typography.captionMedium,
    fontWeight: "600",
    color: Colors.gray700,
  },
  actionButtonTextActive: {
    color: Colors.accent600,
  },
  filterButton: {
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: Colors.accent500,
    borderColor: Colors.accent500,
  },
  filterButtonText: {
    color: Colors.white,
  },
  filterCountBadge: {
    position: "absolute",
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: Colors.error500,
    borderRadius: scaleSize(8),
    paddingHorizontal: spacing.xs,
    minWidth: scaleSize(16),
    height: scaleSize(16),
    ...layout.center,
  },
  filterCountText: {
    ...typography.captionSmall,
    color: Colors.white,
    fontWeight: "700",
    fontSize: scaleSize(9),
  },
  quickFiltersScroll: {
    flexGrow: 0,
  },
  quickFiltersContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  quickFilterChip: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: scaleSize(16),
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: spacing.xs,
  },
  quickFilterChipActive: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    ...deviceAdjustments.shadow,
  },
  quickFilterText: {
    ...typography.captionMedium,
    fontWeight: "600",
    color: Colors.gray700,
  },
  quickFilterTextActive: {
    fontWeight: "700",
  },
  suggestionChip: {
    backgroundColor: Colors.warning100,
    borderColor: Colors.warning300,
  },
  suggestionText: {
    color: Colors.warning700,
  },
  sortContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sortOptionsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sortOption: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: scaleSize(16),
    backgroundColor: Colors.accent100,
    borderWidth: 1,
    borderColor: Colors.accent200,
    gap: spacing.xs,
  },
  sortOptionText: {
    ...typography.captionMedium,
    fontWeight: "600",
    color: Colors.accent700,
  },
});

export default React.memo(CompactFilterBar);
