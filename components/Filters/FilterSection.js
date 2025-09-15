// Individual Filter Section Component - Handles different filter types
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
} from "react-native";
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
import FilterOption from "./FilterOption";
import PriceRangeFilter from "./PriceRangeFilter";
import RatingFilter from "./RatingFilter";

function FilterSection({
  title,
  icon,
  filterType,
  config,
  options,
  counts,
  activeValues,
  isExpanded,
  onToggleExpand,
  onFilterUpdate,
  compactMode = false,
}) {
  const [showAllOptions, setShowAllOptions] = useState(false);

  // Configure LayoutAnimation for smooth expand/collapse
  const toggleExpand = () => {
    if (Platform.OS === "ios") {
      LayoutAnimation.configureNext({
        duration: 250,
        create: { type: "easeInEaseOut", property: "opacity" },
        update: { type: "easeInEaseOut" },
        delete: { type: "easeInEaseOut", property: "opacity" },
      });
    }
    onToggleExpand();
  };

  // Calculate how many options to show initially
  const maxInitialOptions = compactMode ? 3 : 5;
  const hasMoreOptions = options.length > maxInitialOptions;
  const displayOptions = showAllOptions
    ? options
    : options.slice(0, maxInitialOptions);

  // Calculate total active count for this filter
  const activeCount = activeValues.length;

  // Render content based on filter type
  const renderFilterContent = () => {
    switch (config.type) {
      case "range":
        if (filterType === "priceRange") {
          return (
            <PriceRangeFilter
              ranges={config.ranges}
              counts={counts}
              activeValues={activeValues}
              onFilterUpdate={onFilterUpdate}
              filterType={filterType}
            />
          );
        }
        break;

      case "multi":
        if (filterType === "rating") {
          return (
            <RatingFilter
              options={config.options}
              counts={counts}
              activeValues={activeValues}
              onFilterUpdate={onFilterUpdate}
              filterType={filterType}
            />
          );
        }
      // Fall through to default case for other multi-select filters

      case "single":
      default:
        return (
          <View style={styles.optionsContainer}>
            {displayOptions.map((option, index) => {
              const count = counts[option] || 0;
              const isActive = activeValues.includes(option);

              return (
                <FilterOption
                  key={`${option}-${index}`}
                  label={option}
                  count={count}
                  isActive={isActive}
                  onPress={() => onFilterUpdate(filterType, option)}
                  isMultiSelect={config.type === "multi"}
                  compactMode={compactMode}
                />
              );
            })}

            {hasMoreOptions && (
              <Pressable
                style={styles.showMoreButton}
                onPress={() => setShowAllOptions(!showAllOptions)}
                android_ripple={{ color: Colors.accent200, borderless: false }}
              >
                <Text style={styles.showMoreText}>
                  {showAllOptions
                    ? `Show Less`
                    : `Show ${options.length - maxInitialOptions} More`}
                </Text>
                <Ionicons
                  name={showAllOptions ? "chevron-up" : "chevron-down"}
                  size={iconSizes.sm}
                  color={Colors.accent600}
                />
              </Pressable>
            )}
          </View>
        );
    }
  };

  if (!isExpanded) {
    // Collapsed state - show only header with summary
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.header}
          onPress={toggleExpand}
          android_ripple={{ color: Colors.accent200, borderless: false }}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                activeCount > 0 && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={icon}
                size={iconSizes.sm}
                color={activeCount > 0 ? Colors.white : Colors.accent600}
              />
            </View>
            <Text style={[styles.title, activeCount > 0 && styles.titleActive]}>
              {title}
            </Text>
            {activeCount > 0 && (
              <View style={styles.activeCountBadge}>
                <Text style={styles.activeCountText}>{activeCount}</Text>
              </View>
            )}
          </View>

          <Ionicons
            name="chevron-down"
            size={iconSizes.md}
            color={Colors.gray600}
          />
        </Pressable>
      </View>
    );
  }

  // Expanded state - show full content
  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable
        style={styles.header}
        onPress={toggleExpand}
        android_ripple={{ color: Colors.accent200, borderless: false }}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, styles.iconContainerExpanded]}>
            <Ionicons
              name={icon}
              size={iconSizes.sm}
              color={Colors.accent600}
            />
          </View>
          <Text style={[styles.title, styles.titleExpanded]}>{title}</Text>
          {activeCount > 0 && (
            <View style={styles.activeCountBadge}>
              <Text style={styles.activeCountText}>{activeCount}</Text>
            </View>
          )}
        </View>

        <Ionicons
          name="chevron-up"
          size={iconSizes.md}
          color={Colors.accent600}
        />
      </Pressable>

      {/* Content */}
      <Animated.View style={styles.content}>
        {renderFilterContent()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    marginBottom: spacing.sm,
    overflow: "hidden",
    ...deviceAdjustments.shadow,
  },
  header: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    ...layout.flexRow,
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    backgroundColor: Colors.accent100,
    ...layout.center,
    marginRight: spacing.sm,
  },
  iconContainerActive: {
    backgroundColor: Colors.accent600,
  },
  iconContainerExpanded: {
    backgroundColor: Colors.accent100,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray700,
    flex: 1,
  },
  titleActive: {
    color: Colors.accent700,
    fontWeight: "700",
  },
  titleExpanded: {
    color: Colors.gray900,
    fontWeight: "700",
  },
  activeCountBadge: {
    backgroundColor: Colors.accent500,
    borderRadius: scaleSize(10),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    marginLeft: spacing.sm,
    minWidth: scaleSize(20),
    ...layout.center,
  },
  activeCountText: {
    ...typography.captionSmall,
    color: Colors.white,
    fontWeight: "700",
    fontSize: scaleSize(10),
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: Colors.gray50,
  },
  optionsContainer: {
    gap: spacing.xs,
  },
  showMoreButton: {
    ...layout.flexRow,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.accent100,
    borderRadius: scaleSize(8),
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  showMoreText: {
    ...typography.bodySmall,
    color: Colors.accent600,
    fontWeight: "600",
  },
});

export default React.memo(FilterSection);
