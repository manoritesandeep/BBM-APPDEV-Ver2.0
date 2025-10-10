import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../store/theme-context";
import { useI18n } from "../../store/i18n-context";
import EnhancedSearchBar from "../SearchComponents/EnhancedSearchBar";
import {
  spacing,
  scaleVertical,
  deviceAdjustments,
} from "../../constants/responsive";

/**
 * HomeSearchBar - Search bar component optimized for home screen
 *
 * This component provides a prominent search bar at the top of the home screen,
 * offering users a quick alternative to browsing categories. When tapped, it
 * navigates to the full search experience.
 *
 * Benefits:
 * - Provides dual navigation paths (search vs browse)
 * - Reduces friction for users who know what they want
 * - Improves accessibility for different shopping preferences
 * - Maintains consistent UI with sticky positioning
 *
 * @param {Object} style - Additional styles to apply to the container
 */
function HomeSearchBar({ style }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useI18n();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.primary200,
      ...deviceAdjustments.shadow,
      elevation: 2,
      zIndex: 10,
    },
    searchBarWrapper: {
      width: "100%",
    },
  });

  // When search bar is focused, navigate to search screen
  const handleSearchFocus = () => {
    navigation.navigate("SearchResults");
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchBarWrapper}>
        <EnhancedSearchBar
          placeholder={t("home.searchPlaceholder") || "Search for products..."}
          onFocus={handleSearchFocus}
          enableVoiceSearch={true}
          autoFocus={false}
        />
      </View>
    </View>
  );
}

export default HomeSearchBar;
