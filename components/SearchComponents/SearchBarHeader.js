import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useSearch } from "../../store/search-context";
import { useSafeArea } from "../UI/SafeAreaWrapper";
import EnhancedSearchBar from "./EnhancedSearchBar";
import { spacing, scaleVertical } from "../../constants/responsive";

/**
 * SearchBarHeader Component
 *
 * A specialized header component that renders a search bar with navigation integration.
 * This component handles search state management and navigation between search results
 * and main screens. It also includes safe area handling for proper display on devices
 * with notches or dynamic islands.
 *
 * Features:
 * - Integration with search context for state management
 * - Automatic navigation to/from search results
 * - Safe area padding for devices with notches
 * - Fallback to local state if search context is unavailable
 */
function SearchBarHeader() {
  const navigation = useNavigation();
  const insets = useSafeArea();

  // Use local state with fallback if search context isn't available
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  let searchQuery = localSearchQuery;
  let setSearchQuery = setLocalSearchQuery;
  let clearSearch = () => setLocalSearchQuery("");

  // Try to use search context, but don't crash if it's not available
  try {
    const searchContext = useSearch();
    if (searchContext) {
      searchQuery = searchContext.searchQuery;
      setSearchQuery = searchContext.setSearchQuery;
      clearSearch = searchContext.clearSearch;
    }
  } catch (error) {
    console.warn("Search context not available, using local state");
  }

  const handleSearchChange = (query) => {
    // Only update the query here. Navigation is handled in an effect
    // to avoid scheduling navigation/state updates during React's
    // insertion/render phase which can cause warnings.
    setSearchQuery(query);
  };

  // Perform navigation as a side-effect when searchQuery changes.
  // Use a ref to skip the initial mount to avoid navigation on mount.
  const isFirstRunRef = useRef(true);
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    const q = (searchQuery || "").trim();

    // schedule navigation on next tick so it never runs during insertion
    // phase and avoids React warnings about scheduling updates.
    const t = setTimeout(() => {
      try {
        if (q.length >= 2) {
          navigation.navigate("SearchResults");
        } else if (q.length === 0) {
          navigation.navigate("HomeMain");
        }
      } catch (navError) {
        console.warn("Navigation error:", navError);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [searchQuery, navigation]);

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 0,
        paddingTop: insets.top > 0 ? scaleVertical(8) : 0, // Add responsive padding on devices with notch
      }}
    >
      <EnhancedSearchBar
        value={searchQuery}
        onSearchChange={handleSearchChange}
        onClear={clearSearch}
        placeholder="Search products..."
        style={{ marginHorizontal: 0 }}
        enableVoiceSearch={true}
        voiceSearchPlaceholder="🎤 Listening..."
      />
    </View>
  );
}

export default React.memo(SearchBarHeader);
