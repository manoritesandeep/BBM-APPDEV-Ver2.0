// Filter Demo Component - Showcases the intelligent filtering system
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FilterContextProvider, useFilter } from "../../store/filter-context";
import { DUMMY_PRODUCTS } from "../../data/dummy-data";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  layout,
  deviceAdjustments,
} from "../../constants/responsive";
import FilterPanel from "./FilterPanel";
import CompactFilterBar from "./CompactFilterBar";

// Demo Content Component
function FilterDemoContent() {
  const {
    filteredProducts,
    selectedCategory,
    activeFilters,
    appliedFiltersCount,
    availableFilters,
    suggestedFilters,
    setCategory,
    updateFilter,
    clearAllFilters,
  } = useFilter();

  const [filterPanelVisible, setFilterPanelVisible] = useState(false);

  // Get unique categories from products
  const categories = [...new Set(DUMMY_PRODUCTS.map((p) => p.category))];

  // Get filter statistics
  const stats = {
    totalProducts: DUMMY_PRODUCTS.length,
    filteredProducts: filteredProducts.length,
    categories: categories.length,
    availableFilters: Object.keys(availableFilters).length,
    appliedFilters: appliedFiltersCount,
    suggestions: suggestedFilters.length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 Smart Product Filtering</Text>
        <Text style={styles.subtitle}>
          Intelligent, category-aware filtering for Build Bharat Mart
        </Text>
      </View>

      {/* Statistics Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.filteredProducts}</Text>
            <Text style={styles.statLabel}>Products Found</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.appliedFilters}</Text>
            <Text style={styles.statLabel}>Active Filters</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.availableFilters}</Text>
            <Text style={styles.statLabel}>Filter Types</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.suggestions}</Text>
            <Text style={styles.statLabel}>Smart Suggestions</Text>
          </View>
        </View>
      </View>

      {/* Quick Category Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons
            name="grid-outline"
            size={iconSizes.sm}
            color={Colors.accent600}
          />{" "}
          Quick Categories
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <Pressable
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive,
              ]}
            >
              All Products
            </Text>
          </Pressable>

          {categories.slice(0, 6).map((category, index) => (
            <Pressable
              key={`${category}-${index}`}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Compact Filter Bar */}
      <CompactFilterBar
        onOpenFullFilter={() => setFilterPanelVisible(true)}
        showResultsCount={true}
        showSortButton={true}
        style={styles.filterBar}
      />

      {/* Current Filters Display */}
      {appliedFiltersCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons
                name="funnel"
                size={iconSizes.sm}
                color={Colors.accent600}
              />{" "}
              Active Filters ({appliedFiltersCount})
            </Text>
            <Pressable onPress={clearAllFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFiltersContainer}>
              {Object.entries(activeFilters).map(([filterType, values]) =>
                values.map((value, index) => (
                  <View
                    key={`${filterType}-${value}-${index}`}
                    style={styles.activeFilterChip}
                  >
                    <Text style={styles.activeFilterText}>
                      {filterType}: {value}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Smart Suggestions */}
      {suggestedFilters.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons
              name="bulb"
              size={iconSizes.sm}
              color={Colors.warning600}
            />{" "}
            Smart Suggestions
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsContainer}>
              {suggestedFilters.slice(0, 5).map((suggestion, index) => (
                <Pressable
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  style={styles.suggestionChip}
                  onPress={() =>
                    updateFilter(suggestion.type, suggestion.value)
                  }
                >
                  <Ionicons
                    name="add"
                    size={iconSizes.xs}
                    color={Colors.warning700}
                  />
                  <Text style={styles.suggestionText}>
                    {suggestion.label.split(" (")[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Sample Products Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="grid" size={iconSizes.sm} color={Colors.accent600} />{" "}
          Sample Products
        </Text>

        <ScrollView style={styles.productsContainer}>
          {filteredProducts.slice(0, 5).map((product, index) => (
            <View key={`${product.id}-${index}`} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.productName}
                </Text>
                <Text style={styles.productDetails}>
                  {product.brand} • {product.category}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{product.price.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          ))}

          {filteredProducts.length > 5 && (
            <Text style={styles.moreProducts}>
              +{filteredProducts.length - 5} more products...
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => setFilterPanelVisible(true)}
        >
          <Ionicons name="options" size={iconSizes.sm} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Open Advanced Filters</Text>
        </Pressable>
      </View>

      {/* Filter Panel Modal */}
      <FilterPanel
        visible={filterPanelVisible}
        onClose={() => setFilterPanelVisible(false)}
        showCategorySelector={true}
      />
    </View>
  );
}

// Main Demo Component with Context Provider
function FilterDemo() {
  return (
    <FilterContextProvider products={DUMMY_PRODUCTS}>
      <FilterDemoContent />
    </FilterContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    backgroundColor: Colors.accent500,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: scaleSize(20),
    borderBottomRightRadius: scaleSize(20),
  },
  title: {
    ...typography.h3,
    color: Colors.white,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: Colors.accent100,
    textAlign: "center",
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  statsGrid: {
    ...layout.flexRow,
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.md,
    ...layout.center,
    ...deviceAdjustments.shadow,
  },
  statNumber: {
    ...typography.h4,
    color: Colors.accent600,
    fontWeight: "700",
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.captionSmall,
    color: Colors.gray600,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: Colors.gray800,
    marginBottom: spacing.sm,
  },
  categoriesContainer: {
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(20),
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent500,
    borderColor: Colors.accent500,
  },
  categoryText: {
    ...typography.captionMedium,
    fontWeight: "600",
    color: Colors.gray700,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  filterBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.shadow,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.error100,
    borderRadius: scaleSize(6),
  },
  clearButtonText: {
    ...typography.captionMedium,
    color: Colors.error700,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    ...layout.flexRow,
    gap: spacing.sm,
  },
  activeFilterChip: {
    backgroundColor: Colors.accent100,
    borderRadius: scaleSize(16),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent200,
  },
  activeFilterText: {
    ...typography.captionMedium,
    color: Colors.accent700,
    fontWeight: "600",
  },
  suggestionsContainer: {
    ...layout.flexRow,
    gap: spacing.sm,
  },
  suggestionChip: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.warning100,
    borderRadius: scaleSize(16),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning300,
    gap: spacing.xs,
  },
  suggestionText: {
    ...typography.captionMedium,
    color: Colors.warning700,
    fontWeight: "600",
  },
  productsContainer: {
    maxHeight: scaleSize(200),
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...deviceAdjustments.shadow,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  productDetails: {
    ...typography.captionMedium,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: Colors.accent600,
  },
  moreProducts: {
    ...typography.captionMedium,
    color: Colors.gray500,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: spacing.sm,
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  primaryButton: {
    ...layout.flexRow,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.accent500,
    borderRadius: scaleSize(12),
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...deviceAdjustments.shadow,
  },
  primaryButtonText: {
    ...typography.button,
    color: Colors.white,
    fontWeight: "600",
  },
});

export default FilterDemo;
