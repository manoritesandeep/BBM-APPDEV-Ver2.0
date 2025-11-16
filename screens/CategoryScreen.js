import { useState, useLayoutEffect, useMemo, useCallback } from "react";
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
import HorizontalProductCard from "../components/UI/HorizontalProductCard";
import ProductModal from "../components/HomeComponents/ProductModal";
import CategorySearchBar from "../components/SearchComponents/CategorySearchBar";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
} from "../constants/responsive";
import { formatProductName } from "../util/formatProductName";
import { searchProducts } from "../util/searchUtils";
import { groupProductsByName } from "../util/groupedProductsByName";

// Import the advanced filtering system
import { FilterContextProvider, useFilter } from "../store/filter-context";
import FilterPanel from "../components/Filters/FilterPanel";
import CompactFilterBar from "../components/Filters/CompactFilterBar";

/**
 * CategoryScreen - Full-screen view to display all products in a category
 *
 * This screen implements lazy loading, efficient rendering, search, and filtering for category products:
 * - Only loads when user navigates to the screen (on-demand data loading)
 * - Uses FlatList virtualization for performance with large product lists
 * - Displays products in a responsive grid layout
 * - Supports pull-to-refresh for future enhancements
 * - Allows opening ProductModal on top to browse products without leaving the category
 * - Includes in-category search to quickly find specific products
 * - Advanced filtering system for brand, price, rating, and more
 *
 * Benefits:
 * - Better UX: Users can browse, search, and filter products in the same category
 * - Reduces initial data load by fetching category products only when needed
 * - Improves memory efficiency with virtualized lists
 * - Provides smooth scrolling even with hundreds of products
 * - Minimizes cloud costs by avoiding unnecessary data transfers
 * - Quick product discovery with search and filter
 *
 * @param {Object} route - React Navigation route object containing:
 *   - categoryName: Name of the category being displayed
 *   - productGroups: Array of product groups in this category
 * @param {Object} navigation - React Navigation navigation object
 */
function CategoryScreenContent({ route, navigation }) {
  const { categoryName, productGroups } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);

  // Use filtered products from the filter context
  const { filteredProducts, appliedFiltersCount } = useFilter();

  // Apply category search on top of filtered products
  const displayProducts = useMemo(() => {
    let products = filteredProducts;

    // If there's a search query, filter the already-filtered products
    if (categorySearchQuery && categorySearchQuery.trim().length >= 2) {
      products = searchProducts(
        categorySearchQuery,
        filteredProducts,
        true,
        100
      );
    }

    // Group products by name to combine same products with different sizes
    return groupProductsByName(products);
  }, [filteredProducts, categorySearchQuery]);

  // Set header title and search bar
  useLayoutEffect(() => {
    const formattedCategoryName = categoryName
      ? formatProductName(categoryName)
      : "";

    navigation.setOptions({
      title: formattedCategoryName,
      headerTitle: () => (
        <CategorySearchBar
          value={categorySearchQuery}
          onSearchChange={handleCategorySearchChange}
          onClear={handleClearCategorySearch}
          categoryName={formattedCategoryName}
        />
      ),
      headerStyle: {
        backgroundColor: colors.card,
      },
      headerTintColor: colors.text,
      headerShadowVisible: true,
    });
  }, [
    navigation,
    categoryName,
    colors,
    categorySearchQuery,
    handleCategorySearchChange,
    handleClearCategorySearch,
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary100,
    },
    filterContainer: {
      backgroundColor: colors.surface || "#fff",
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.primary200,
      marginBottom: 4,
    },
    filterBar: {
      marginHorizontal: 0,
      borderRadius: 0,
      shadowOpacity: 0,
      elevation: 0,
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
    searchInfo: {
      color: colors.text,
      fontWeight: "600",
    },
    filterInfo: {
      color: colors.accent600 || "#2563eb",
      fontWeight: "600",
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

  const totalProducts = displayProducts?.length || 0;
  const totalOriginalProducts = productGroups?.length || 0;

  // Filter handlers
  const handleOpenFilter = useCallback(() => {
    setFilterPanelVisible(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setFilterPanelVisible(false);
  }, []);

  // Search handlers
  const handleCategorySearchChange = useCallback((query) => {
    setCategorySearchQuery(query);
  }, []);

  const handleClearCategorySearch = useCallback(() => {
    setCategorySearchQuery("");
  }, []);

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
      searchQuery={categorySearchQuery}
      isLast={index === displayProducts.length - 1}
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
  const EmptyComponent = () => {
    // Check if empty due to search
    if (categorySearchQuery && categorySearchQuery.trim().length >= 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText} allowFontScaling={true}>
            No products found for "{categorySearchQuery}"
          </Text>
          <Text
            style={[
              styles.emptyText,
              { fontSize: scaleSize(12), marginTop: spacing.xs },
            ]}
            allowFontScaling={true}
          >
            Try adjusting your search or filters
          </Text>
        </View>
      );
    }

    // Check if empty due to filters
    if (appliedFiltersCount > 0 && totalOriginalProducts > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="funnel-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText} allowFontScaling={true}>
            No products match your filters
          </Text>
          <Text
            style={[
              styles.emptyText,
              { fontSize: scaleSize(12), marginTop: spacing.xs },
            ]}
            allowFontScaling={true}
          >
            Try adjusting your filter criteria
          </Text>
        </View>
      );
    }

    // Default empty state
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText} allowFontScaling={true}>
          {t("home.noProductsInCategory") ||
            "No products found in this category"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Filter Bar - Show when products exist */}
      {totalOriginalProducts > 0 && (
        <View style={styles.filterContainer}>
          <CompactFilterBar
            onOpenFullFilter={handleOpenFilter}
            showResultsCount={true}
            showSortButton={true}
            style={styles.filterBar}
          />
        </View>
      )}

      {/* Product count and search info */}
      {totalProducts > 0 && (
        <View style={styles.productCount}>
          <Text style={styles.productCountText} allowFontScaling={true}>
            {`${totalProducts} ${totalProducts === 1 ? "product" : "products"}${
              categorySearchQuery && categorySearchQuery.trim().length >= 2
                ? ` for "${categorySearchQuery}"`
                : ""
            }${
              appliedFiltersCount > 0
                ? ` • ${appliedFiltersCount} filter${
                    appliedFiltersCount !== 1 ? "s" : ""
                  } applied`
                : ""
            }`}
          </Text>
        </View>
      )}

      {/* Product grid */}
      <FlatList
        data={displayProducts}
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

      {/* Advanced Filter Panel Modal */}
      <FilterPanel
        visible={filterPanelVisible}
        onClose={handleCloseFilter}
        showCategorySelector={false}
        compactMode={false}
      />
    </SafeAreaView>
  );
}

// Main CategoryScreen wrapper with Filter Context Provider
function CategoryScreen({ route, navigation }) {
  const { productGroups } = route.params;

  // Flatten the grouped products for filtering
  const flattenedProducts = productGroups.reduce((acc, group) => {
    if (Array.isArray(group)) {
      return [...acc, ...group];
    } else {
      return [...acc, group];
    }
  }, []);

  return (
    <FilterContextProvider products={flattenedProducts || []}>
      <CategoryScreenContent route={route} navigation={navigation} />
    </FilterContextProvider>
  );
}

export default CategoryScreen;
