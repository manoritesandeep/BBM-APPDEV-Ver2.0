// Category Selector Component - Quick category switching
import React, { useMemo } from "react";
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

// Category configuration with icons and colors
const CATEGORIES = [
  {
    name: "All Categories",
    value: null,
    icon: "grid-outline",
    color: Colors.gray600,
  },
  {
    name: "Paints",
    value: "PAINTS",
    icon: "brush-outline",
    color: "#FF6B6B",
  },
  {
    name: "Lighting",
    value: "LIGHTING",
    icon: "bulb-outline",
    color: "#FFE66D",
  },
  {
    name: "Plumbing",
    value: "PLUMBING",
    icon: "water-outline",
    color: "#4ECDC4",
  },
  {
    name: "Electrical",
    value: "ELECTRICAL",
    icon: "flash-outline",
    color: "#95E1D3",
  },
  {
    name: "Hardware",
    value: "HARDWARE",
    icon: "hammer-outline",
    color: "#C7CEEA",
  },
  {
    name: "Tools",
    value: "TOOLS",
    icon: "build-outline",
    color: "#FFEAA7",
  },
  {
    name: "Tiles",
    value: "TILES",
    icon: "square-outline",
    color: "#DDA0DD",
  },
  {
    name: "Furniture",
    value: "FURNITURE",
    icon: "bed-outline",
    color: "#98D8C8",
  },
  {
    name: "Garden",
    value: "GARDEN",
    icon: "leaf-outline",
    color: "#8FBC8F",
  },
  {
    name: "Safety",
    value: "SAFETY",
    icon: "shield-checkmark-outline",
    color: "#FFB347",
  },
];

function CategorySelector({
  selectedCategory,
  onCategorySelect,
  compactMode = false,
  availableCategories = null,
  style,
}) {
  // Filter categories based on available data
  const displayCategories = useMemo(() => {
    if (!availableCategories) {
      return CATEGORIES;
    }

    return CATEGORIES.filter(
      (category) =>
        category.value === null || availableCategories.includes(category.value)
    );
  }, [availableCategories]);

  const handleCategoryPress = (categoryValue) => {
    if (onCategorySelect) {
      onCategorySelect(categoryValue);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Categories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.scrollView}
      >
        {displayCategories.map((category, index) => {
          const isSelected = selectedCategory === category.value;

          return (
            <Pressable
              key={`${category.value || "all"}-${index}`}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
                compactMode && styles.categoryChipCompact,
              ]}
              onPress={() => handleCategoryPress(category.value)}
              android_ripple={{
                color: isSelected ? Colors.white : category.color,
                borderless: false,
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                  {
                    backgroundColor: isSelected
                      ? Colors.white
                      : `${category.color}20`,
                  },
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={compactMode ? iconSizes.sm : iconSizes.md}
                  color={isSelected ? category.color : category.color}
                />
              </View>

              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                  compactMode && styles.categoryTextCompact,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
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
  title: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray800,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flexGrow: 0,
  },
  categoriesContainer: {
    gap: spacing.sm,
    paddingRight: spacing.md, // Extra padding for last chip
  },
  categoryChip: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.gray100,
    borderRadius: scaleSize(24),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: scaleSize(44),
  },
  categoryChipSelected: {
    backgroundColor: Colors.accent600,
    borderColor: Colors.accent600,
    shadowColor: Colors.accent600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: scaleSize(36),
  },
  iconContainer: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    ...layout.center,
    marginRight: spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: Colors.white,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray700,
  },
  categoryTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  categoryTextCompact: {
    ...typography.captionMedium,
  },
});

export default React.memo(CategorySelector);
