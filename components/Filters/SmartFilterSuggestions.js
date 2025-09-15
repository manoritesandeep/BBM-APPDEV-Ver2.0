// Smart Filter Suggestions Component - AI-powered filter recommendations
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

function SmartFilterSuggestions({
  suggestions,
  onApplySuggestion,
  activeFilters,
  style,
}) {
  if (!suggestions || suggestions.length === 0) return null;

  // Filter out already applied suggestions
  const availableSuggestions = suggestions.filter((suggestion) => {
    const activeValues = activeFilters[suggestion.type] || [];
    return !activeValues.includes(suggestion.value);
  });

  if (availableSuggestions.length === 0) return null;

  const handleSuggestionPress = (suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion.type, suggestion.value);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons
          name="bulb-outline"
          size={iconSizes.sm}
          color={Colors.warning600}
        />
        <Text style={styles.headerText}>Smart Suggestions</Text>
      </View>

      <Text style={styles.subtitle}>Popular choices for your search</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
        style={styles.scrollView}
      >
        {availableSuggestions.map((suggestion, index) => (
          <Pressable
            key={`${suggestion.type}-${suggestion.value}-${index}`}
            style={styles.suggestionChip}
            onPress={() => handleSuggestionPress(suggestion)}
            android_ripple={{ color: Colors.warning200, borderless: false }}
          >
            <View style={styles.chipIconContainer}>
              <Ionicons
                name="add"
                size={iconSizes.xs}
                color={Colors.warning700}
              />
            </View>

            <Text style={styles.suggestionLabel} numberOfLines={1}>
              {suggestion.label}
            </Text>

            <View style={styles.applyButton}>
              <Ionicons
                name="arrow-forward"
                size={iconSizes.xs}
                color={Colors.warning700}
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
    backgroundColor: Colors.warning50,
    borderRadius: scaleSize(12),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning200,
  },
  header: {
    ...layout.flexRow,
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  headerText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: Colors.warning800,
    marginLeft: spacing.xs,
  },
  subtitle: {
    ...typography.captionMedium,
    color: Colors.warning700,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flexGrow: 0,
  },
  suggestionsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  suggestionChip: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: scaleSize(20),
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: Colors.warning300,
    maxWidth: scaleSize(140),
    shadowColor: Colors.warning600,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chipIconContainer: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.warning100,
    ...layout.center,
    marginRight: spacing.xs,
  },
  suggestionLabel: {
    ...typography.captionMedium,
    color: Colors.warning800,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.xs,
  },
  applyButton: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.warning100,
    ...layout.center,
  },
});

export default React.memo(SmartFilterSuggestions);
