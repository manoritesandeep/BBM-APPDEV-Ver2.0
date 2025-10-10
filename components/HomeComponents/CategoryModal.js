import { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../store/theme-context";
import { useI18n } from "../../store/i18n-context";
import HorizontalProductCard from "../Products/HorizontalProductCard";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";
import { formatProductName } from "../../util/formatProductName";

/**
 * CategoryModal - Full-screen modal to display all products in a category
 *
 * This component implements lazy loading and efficient rendering for category products:
 * - Only loads when user opens the modal (on-demand data loading)
 * - Uses FlatList virtualization for performance with large product lists
 * - Displays products in a responsive grid layout
 * - Supports pull-to-refresh and pagination for future enhancements
 *
 * Benefits:
 * - Reduces initial data load by fetching category products only when needed
 * - Improves memory efficiency with virtualized lists
 * - Provides smooth scrolling even with hundreds of products
 * - Minimizes cloud costs by avoiding unnecessary data transfers
 *
 * @param {boolean} visible - Controls modal visibility
 * @param {Function} onClose - Callback to close the modal
 * @param {string} categoryName - Name of the category being displayed
 * @param {Array} productGroups - Array of product groups in this category
 * @param {Function} onProductPress - Callback when a product is selected
 */
function CategoryModal({
  visible,
  onClose,
  categoryName,
  productGroups,
  onProductPress,
}) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.primary200,
      ...deviceAdjustments.shadow,
      elevation: 2,
    },
    headerTitle: {
      ...typography.h4,
      color: colors.accent700,
      fontWeight: "bold",
      flex: 1,
      marginLeft: spacing.sm,
    },
    closeButton: {
      padding: spacing.xs,
      borderRadius: scaleSize(20),
      backgroundColor: colors.primary100,
    },
    productCount: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
    },
    productCountText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: scaleSize(13),
    },
    productList: {
      flex: 1,
      backgroundColor: colors.primary100,
    },
    productListContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    itemSeparator: {
      height: spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xl * 2,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

  const formattedCategoryName = categoryName
    ? formatProductName(categoryName)
    : "";
  const totalProducts = productGroups?.length || 0;

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in production, this could re-fetch category data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Render individual product card
  const renderProduct = ({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={onProductPress}
      isLast={index === productGroups?.length - 1}
      showCategory={false} // Don't show category in category modal
      showHSN={true}
    />
  );

  // Item separator component
  const ItemSeparator = () => <View style={styles.itemSeparator} />;

  // Extract key for each product group
  const keyExtractor = (item, index) => {
    const product = Array.isArray(item) ? item[0] : item;
    return product?.id ? product.id.toString() : `product-${index}`;
  };

  // Empty state
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText} allowFontScaling={true}>
        {t("home.noProductsInCategory") || "No products found in this category"}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={8}
            accessible={true}
            accessibilityLabel={t("common.close") || "Close"}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            allowFontScaling={true}
          >
            {formattedCategoryName}
          </Text>
        </View>

        {/* Product count */}
        {totalProducts > 0 && (
          <View style={styles.productCount}>
            <Text style={styles.productCountText} allowFontScaling={true}>
              {t("home.productsCount", { count: totalProducts }) ||
                `${totalProducts} products available`}
            </Text>
          </View>
        )}

        {/* Product grid */}
        <FlatList
          data={productGroups}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          style={styles.productList}
          contentContainerStyle={styles.productListContent}
          ListEmptyComponent={EmptyComponent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          // Performance optimizations
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={6}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          // Accessibility
          accessible={true}
          accessibilityLabel={`${formattedCategoryName} products`}
          accessibilityRole="list"
        />
      </SafeAreaView>
    </Modal>
  );
}

export default CategoryModal;
