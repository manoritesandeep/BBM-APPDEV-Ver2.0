// Main Filter Panel Component - Mobile-First, Responsive Design
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "../../store/filter-context";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  scaleVertical,
  iconSizes,
  layout,
  deviceAdjustments,
  getComponentSizes,
  getOrientation,
} from "../../constants/responsive";
import Button from "../UI/Button";
import OutlinedButton from "../UI/OutlinedButton";
import FilterSection from "./FilterSection";
import FilterChips from "./FilterChips";
import CategorySelector from "./CategorySelector";
import SmartFilterSuggestions from "./SmartFilterSuggestions";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function FilterPanel({
  visible,
  onClose,
  style,
  showCategorySelector = true,
  compactMode = false,
}) {
  const {
    activeFilters,
    selectedCategory,
    availableFilters,
    filterCounts,
    appliedFiltersCount,
    filteredProducts,
    suggestedFilters,
    setCategory,
    updateFilter,
    clearFilter,
    clearAllFilters,
    FILTER_CONFIGS,
    CATEGORY_FILTER_MAP,
  } = useFilter();

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: false,
    priceRange: false,
    rating: false,
    colour: false,
    sizes: false,
    subCategory: false,
    material: false,
    availability: false,
    discount: false,
    rentable: false,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Get current orientation and component sizes
  const orientation = getOrientation();
  const isLandscape = orientation === "landscape";
  const componentSizes = getComponentSizes(orientation);

  // Determine relevant filters based on selected category
  const relevantFilters = useMemo(() => {
    const categoryFilters = selectedCategory
      ? CATEGORY_FILTER_MAP[selectedCategory] || []
      : Object.keys(FILTER_CONFIGS);

    // Sort by priority and filter out empty options
    const result = categoryFilters
      .filter((filterType) => {
        const hasOptions =
          availableFilters[filterType] &&
          availableFilters[filterType].length > 0;
        return hasOptions;
      })
      .sort((a, b) => {
        const priorityA = FILTER_CONFIGS[a]?.priority || 999;
        const priorityB = FILTER_CONFIGS[b]?.priority || 999;
        return priorityA - priorityB;
      });

    // Debug logging
    return result;
  }, [selectedCategory, availableFilters, FILTER_CONFIGS, CATEGORY_FILTER_MAP]);

  // Handle section expand/collapse
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  // Handle filter application
  const handleFilterUpdate = useCallback(
    (filterType, value) => {
      const config = FILTER_CONFIGS[filterType];
      const isMultiSelect = config?.type === "multi";
      updateFilter(filterType, value, isMultiSelect);
    },
    [updateFilter, FILTER_CONFIGS]
  );

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category) => {
      setCategory(category);
      // Keep all sections expanded when category changes
      // Don't reset expandedSections here
    },
    [setCategory, CATEGORY_FILTER_MAP]
  );

  // Apply filters and close (for mobile)
  const handleApplyFilters = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 150);
  }, [onClose]);

  // Calculate modal height based on content and orientation
  const modalHeight = useMemo(() => {
    if (isLandscape) {
      return screenHeight * 0.85; // Use most of screen in landscape
    }
    return screenHeight * 0.75; // 75% of screen height in portrait
  }, [isLandscape, screenHeight]);

  // Dynamic styles based on orientation and screen size
  const dynamicStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: Colors.white,
      borderTopLeftRadius: scaleSize(20),
      borderTopRightRadius: scaleSize(20),
      height: modalHeight,
      paddingTop: spacing.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    header: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
    },
    headerTitle: {
      ...typography.h4,
      color: Colors.gray900,
      fontWeight: "700",
    },
    resultsText: {
      ...typography.bodySmall,
      color: Colors.gray600,
      marginTop: spacing.xs / 2,
    },
    closeButton: {
      padding: spacing.sm,
      borderRadius: scaleSize(8),
      backgroundColor: Colors.gray200,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      flexGrow: 1,
    },
    sectionSpacing: {
      marginBottom: spacing.lg,
      backgroundColor: Colors.white,
      borderRadius: scaleSize(12),
      padding: spacing.md,
      borderWidth: 2,
      borderColor: Colors.accent500,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    footer: {
      ...layout.flexRow,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: Colors.borderLight,
      backgroundColor: Colors.white,
      gap: spacing.md,
    },
    footerButton: {
      flex: 1,
    },
    clearButton: {
      backgroundColor: Colors.gray200,
    },
    clearButtonText: {
      color: Colors.gray700,
    },
    applyButton: {
      backgroundColor: Colors.accent500,
    },
    filtersCountBadge: {
      backgroundColor: Colors.accent500,
      borderRadius: scaleSize(12),
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      marginLeft: spacing.sm,
    },
    filtersCountText: {
      ...typography.captionSmall,
      color: Colors.white,
      fontWeight: "600",
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={dynamicStyles.modalContainer}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <Animated.View style={dynamicStyles.modalContent}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <View style={layout.flexRow}>
              <Text style={dynamicStyles.headerTitle}>Filters</Text>
              {appliedFiltersCount > 0 && (
                <View style={dynamicStyles.filtersCountBadge}>
                  <Text style={dynamicStyles.filtersCountText}>
                    {appliedFiltersCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={layout.flexRow}>
              <Text style={dynamicStyles.resultsText}>
                {filteredProducts.length} products
              </Text>
              <Pressable
                style={dynamicStyles.closeButton}
                onPress={onClose}
                android_ripple={{ color: Colors.gray300, borderless: true }}
              >
                <Ionicons
                  name="close"
                  size={iconSizes.md}
                  color={Colors.gray700}
                />
              </Pressable>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {/* Category Selector */}
            {showCategorySelector && (
              <View style={dynamicStyles.sectionSpacing}>
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  compactMode={compactMode}
                />
              </View>
            )}

            {/* Active Filter Chips */}
            {appliedFiltersCount > 0 && (
              <View style={dynamicStyles.sectionSpacing}>
                <FilterChips
                  activeFilters={activeFilters}
                  onRemoveFilter={clearFilter}
                  onClearAll={clearAllFilters}
                  filterConfigs={FILTER_CONFIGS}
                />
              </View>
            )}

            {/* Smart Filter Suggestions */}
            {suggestedFilters.length > 0 && appliedFiltersCount < 3 && (
              <View style={dynamicStyles.sectionSpacing}>
                <SmartFilterSuggestions
                  suggestions={suggestedFilters}
                  onApplySuggestion={handleFilterUpdate}
                  activeFilters={activeFilters}
                />
              </View>
            )}

            {/* Filter Sections */}
            {relevantFilters.map((filterType, index) => {
              const config = FILTER_CONFIGS[filterType];
              const isExpanded = expandedSections[filterType];
              const options = availableFilters[filterType] || [];
              const counts = filterCounts[filterType] || {};

              if (options.length === 0) return null;

              return (
                <View key={filterType} style={dynamicStyles.sectionSpacing}>
                  <FilterSection
                    title={config.label}
                    icon={config.icon}
                    filterType={filterType}
                    config={config}
                    options={options}
                    counts={counts}
                    activeValues={activeFilters[filterType] || []}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleSection(filterType)}
                    onFilterUpdate={handleFilterUpdate}
                    compactMode={compactMode}
                  />
                </View>
              );
            })}

            {/* Empty State */}
            {relevantFilters.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="funnel-outline"
                  size={iconSizes.xxl}
                  color={Colors.gray400}
                />
                <Text style={styles.emptyTitle}>No filters available</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedCategory
                    ? `No filter options found for ${selectedCategory}`
                    : "Select a category to see available filters"}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={dynamicStyles.footer}>
            <OutlinedButton
              onPress={clearAllFilters}
              style={[dynamicStyles.footerButton, dynamicStyles.clearButton]}
              textStyle={dynamicStyles.clearButtonText}
              disabled={appliedFiltersCount === 0}
            >
              Clear All
            </OutlinedButton>

            <Button
              onPress={handleApplyFilters}
              style={[dynamicStyles.footerButton, dynamicStyles.applyButton]}
              disabled={isAnimating}
            >
              Apply Filters
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    ...layout.center,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h5,
    color: Colors.gray700,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: Colors.gray500,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});

export default React.memo(FilterPanel);
