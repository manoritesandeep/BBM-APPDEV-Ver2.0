import { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../store/theme-context";
import { useI18n } from "../store/i18n-context";
import HorizontalProductCard from "../components/Products/HorizontalProductCard";
import ProductModal from "../components/HomeComponents/ProductModal";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
} from "../constants/responsive";
import { formatProductName } from "../util/formatProductName";

/**
 * CategoryScreen - Full-screen view to display all products in a category
 *
 * This screen implements lazy loading and efficient rendering for category products:
 * - Only loads when user navigates to the screen (on-demand data loading)
 * - Uses FlatList virtualization for performance with large product lists
 * - Displays products in a responsive grid layout
 * - Supports pull-to-refresh for future enhancements
 * - Allows opening ProductModal on top to browse products without leaving the category
 *
 * Benefits:
 * - Better UX: Users can browse multiple products in the same category without going back
 * - Reduces initial data load by fetching category products only when needed
 * - Improves memory efficiency with virtualized lists
 * - Provides smooth scrolling even with hundreds of products
 * - Minimizes cloud costs by avoiding unnecessary data transfers
 *
 * @param {Object} route - React Navigation route object containing:
 *   - categoryName: Name of the category being displayed
 *   - productGroups: Array of product groups in this category
 * @param {Object} navigation - React Navigation navigation object
 */
function CategoryScreen({ route, navigation }) {
  const { categoryName, productGroups } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Set header title
  useLayoutEffect(() => {
    const formattedCategoryName = categoryName
      ? formatProductName(categoryName)
      : "";

    navigation.setOptions({
      title: formattedCategoryName,
      headerStyle: {
        backgroundColor: colors.card,
      },
      headerTintColor: colors.text,
      headerShadowVisible: true,
    });
  }, [navigation, categoryName, colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary100,
    },
    productCount: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.primary200,
    },
    productCountText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: scaleSize(13),
    },
    productList: {
      flex: 1,
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
      marginTop: spacing.sm,
    },
  });

  const totalProducts = productGroups?.length || 0;

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in production, this could re-fetch category data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle product press - open ProductModal
  const handleProductPress = (productGroup) => {
    const product = Array.isArray(productGroup)
      ? productGroup[0]
      : productGroup;
    setSelectedProduct(product);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Cart context is handled inside HorizontalProductCard
    // This is just a placeholder if we need custom logic
  };

  // Close ProductModal
  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  // Render individual product card
  const renderProduct = ({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={handleProductPress}
      onAddToCart={handleAddToCart}
      isLast={index === productGroups.length - 1}
      showCategory={false} // Don't show category since we're already in a category
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
        accessibilityLabel={`${categoryName} products`}
        accessibilityRole="list"
      />

      {/* Product Modal - Shows product details */}
      <ProductModal
        visible={!!selectedProduct}
        onClose={closeProductModal}
        product={selectedProduct}
      />
    </SafeAreaView>
  );
}

export default CategoryScreen;
