import { FlatList, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../store/theme-context";
import { useI18n } from "../../store/i18n-context";
import CategoryCard from "./CategoryCard";
import { typography, spacing, scaleVertical } from "../../constants/responsive";

/**
 * CategoryList - Efficiently renders categories using FlatList with virtualization
 *
 * This component uses FlatList to render categories efficiently with the following optimizations:
 * - Virtualization: Only renders visible items + small buffer
 * - Window size: Controls how many items are kept in memory
 * - Initial render: Optimizes first paint performance
 * - Remove clipped subviews: Unmounts off-screen components on Android
 *
 * These optimizations significantly reduce memory usage and improve performance when
 * displaying thousands of products across many categories.
 *
 * @param {Array} categories - Array of category objects with {name, productGroups, count}
 * @param {Function} onCategoryPress - Callback when a category card is pressed
 * @param {boolean} loading - Whether categories are still loading
 * @param {Function} onRefresh - Optional pull-to-refresh handler
 * @param {boolean} refreshing - Whether refresh is in progress
 */
function CategoryList({
  categories,
  onCategoryPress,
  loading = false,
  onRefresh,
  refreshing = false,
}) {
  const { colors } = useTheme();
  const { t } = useI18n();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary100,
    },
    contentContainer: {
      paddingTop: spacing.xs,
      paddingBottom: spacing.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.md,
    },
    separator: {
      height: spacing.xs * 0.5,
    },
  });

  // Render individual category card
  const renderCategoryCard = ({ item }) => (
    <CategoryCard
      category={item.name}
      productGroups={item.productGroups}
      productCount={item.count}
      onPress={onCategoryPress}
    />
  );

  // Extract unique key for each category
  const keyExtractor = (item) => item.name;

  // Item separator component
  const ItemSeparator = () => <View style={styles.separator} />;

  // Empty state component
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText} allowFontScaling={true}>
        {loading
          ? t("common.loading") || "Loading categories..."
          : t("home.noCategoriesFound") || "No categories found"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryCard}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
      // Performance optimizations
      windowSize={5} // Number of pages to render (default 21)
      maxToRenderPerBatch={5} // Number of items to render per batch
      initialNumToRender={4} // Number of items to render initially
      removeClippedSubviews={true} // Unmount off-screen components (Android)
      updateCellsBatchingPeriod={50} // Delay batch rendering
      // Pull to refresh
      onRefresh={onRefresh}
      refreshing={refreshing}
      // Accessibility
      accessible={true}
      accessibilityLabel={t("home.categoryList") || "Categories list"}
      accessibilityRole="list"
    />
  );
}

export default CategoryList;
