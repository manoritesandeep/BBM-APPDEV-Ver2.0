import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";

import EnhancedSearchBar from "./EnhancedSearchBar";
import { useSafeArea } from "../UI/SafeAreaWrapper";
import { spacing, scaleVertical } from "../../constants/responsive";

/**
 * CategorySearchBar Component
 *
 * A specialized search bar for category screens that filters products
 * within the current category. Unlike the global search that navigates
 * to SearchResultsScreen, this component updates a local search query
 * state that can be used to filter the displayed products.
 *
 * Features:
 * - Local search state for in-category filtering
 * - Safe area padding for devices with notches
 * - Voice search support
 * - Debounced search input
 *
 * @param {string} value - Current search query value
 * @param {function} onSearchChange - Callback when search query changes
 * @param {function} onClear - Callback when search is cleared
 * @param {string} categoryName - Name of the current category for placeholder
 */
function CategorySearchBar({
  value = "",
  onSearchChange,
  onClear,
  categoryName = "",
}) {
  const insets = useSafeArea();
  const [localSearchQuery, setLocalSearchQuery] = useState(value);

  // Sync local state with parent state
  useEffect(() => {
    setLocalSearchQuery(value);
  }, [value]);

  const handleSearchChange = (query) => {
    setLocalSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handleClear = () => {
    setLocalSearchQuery("");
    if (onClear) {
      onClear();
    }
  };

  const placeholder = categoryName
    ? `Search in ${categoryName}...`
    : "Search in this category...";

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 0,
        paddingTop: insets.top > 0 ? scaleVertical(8) : 0,
      }}
    >
      <EnhancedSearchBar
        value={localSearchQuery}
        onSearchChange={handleSearchChange}
        onClear={handleClear}
        placeholder={placeholder}
        style={{ marginHorizontal: 0 }}
        enableVoiceSearch={true}
        voiceSearchPlaceholder="🎤 Listening..."
      />
    </View>
  );
}

export default CategorySearchBar;
