import React, { useContext, useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CategoryCard from "./CategoryCard";
import { ProductsContext } from "../../../store/products-context";
import { FilterContextProvider } from "../../../store/filter-context";
import { Colors } from "../../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  getDeviceSize,
  isTablet,
} from "../../../constants/responsive";
import { useDeviceOrientation } from "../../../hooks/useResponsive";

// Category configuration with enhanced metadata
const CATEGORIES = [
  {
    name: "Paints",
    value: "PAINTS",
    icon: "brush-outline",
    color: "#FF6B6B",
    description: "Interior & Exterior Paints",
  },
  {
    name: "Lighting",
    value: "LIGHTING",
    icon: "bulb-outline",
    color: "#FFE66D",
    description: "LED, Bulbs & Fixtures",
  },
  {
    name: "Plumbing",
    value: "PLUMBING",
    icon: "water-outline",
    color: "#4ECDC4",
    description: "Pipes, Fittings & Accessories",
  },
  {
    name: "Electrical",
    value: "ELECTRICAL",
    icon: "flash-outline",
    color: "#95E1D3",
    description: "Wires, Switches & Components",
  },
  {
    name: "Hardware",
    value: "HARDWARE",
    icon: "hammer-outline",
    color: "#C7CEEA",
    description: "Tools & Fasteners",
  },
  {
    name: "Tiles",
    value: "TILES",
    icon: "square-outline",
    color: "#DDA0DD",
    description: "Floor & Wall Tiles",
  },
  {
    name: "Furniture",
    value: "FURNITURE",
    icon: "bed-outline",
    color: "#98D8C8",
    description: "Home & Office Furniture",
  },
  {
    name: "Garden",
    value: "GARDEN",
    icon: "leaf-outline",
    color: "#8FBC8F",
    description: "Outdoor & Landscaping",
  },
  {
    name: "Safety",
    value: "SAFETY",
    icon: "shield-checkmark-outline",
    color: "#FFB347",
    description: "Safety Equipment & Gear",
  },
  {
    name: "Sanitary",
    value: "SANITARY ACCESSORIES",
    icon: "water-outline",
    color: "#87CEEB",
    description: "Bathroom Accessories",
  },
];

function CategoryContent({ compact = false }) {
  const navigation = useNavigation();
  const { products } = useContext(ProductsContext);
  const { orientation } = useDeviceOrientation();

  // Calculate grid dimensions based on device and orientation
  const numColumns = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    const isLandscapeMode = orientation === "landscape";

    if (compact) {
      return isLandscapeMode ? 3 : 2;
    }

    if (isTablet()) {
      return isLandscapeMode ? 3 : 2;
    } else {
      return isLandscapeMode ? 2 : 1;
    }
  }, [orientation, compact]);

  // Memoized category data with product counts and top brands
  const enrichedCategories = useMemo(() => {
    if (!products || products.length === 0) {
      return CATEGORIES.map((category) => ({
        ...category,
        productCount: 0,
        topBrands: [],
      }));
    }

    return CATEGORIES.map((category) => {
      // Filter products for this category
      const categoryProducts = products.filter(
        (product) => product.category === category.value
      );

      // Get product count
      const productCount = categoryProducts.length;

      // Get top brands for this category
      const brandCounts = {};
      categoryProducts.forEach((product) => {
        if (product.brand) {
          brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
        }
      });

      const topBrands = Object.entries(brandCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([brand]) => brand);

      return {
        ...category,
        productCount,
        topBrands,
      };
    });
  }, [products]);

  // Filter out categories with no products (optional)
  const visibleCategories = useMemo(() => {
    // Show all categories for better UX, even if they have 0 products
    return enrichedCategories;
  }, [enrichedCategories]);

  const handleCategoryPress = useCallback(
    (category) => {
      // Navigate to products screen with category filter
      navigation.navigate("AllProductsScreen", {
        category: category.value,
        categoryName: category.name,
      });
    },
    [navigation]
  );

  const renderCategoryCard = useCallback(
    ({ item }) => (
      <View
        style={[styles.cardContainer, { width: `${100 / numColumns - 2}%` }]}
      >
        <CategoryCard
          category={item}
          productCount={item.productCount}
          topBrands={item.topBrands}
          onPress={handleCategoryPress}
          compact={compact}
        />
      </View>
    ),
    [numColumns, compact, handleCategoryPress]
  );

  const keyExtractor = useCallback((item) => item.value || item.name, []);

  if (!visibleCategories || visibleCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Shop by Category</Text>
          <Text style={styles.subtitle}>
            Find exactly what you need from our wide range of products
          </Text>
        </View>
      )}

      <FlatList
        data={visibleCategories}
        renderItem={renderCategoryCard}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`${numColumns}-${orientation}`} // Force re-render on orientation change
        contentContainerStyle={[
          styles.listContainer,
          compact && styles.listContainerCompact,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: compact ? 70 : 100,
          offset: (compact ? 70 : 100) * Math.floor(index / numColumns),
          index,
        })}
      />
    </View>
  );
}

// Wrapper component that provides FilterContextProvider if needed
function CategoryContentWrapper(props) {
  const { products } = useContext(ProductsContext);

  return (
    <FilterContextProvider products={products || []}>
      <CategoryContent {...props} />
    </FilterContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...typography.heading2,
    color: Colors.gray900,
    marginBottom: spacing.xs,
    fontWeight: "700",
  },
  subtitle: {
    ...typography.body1,
    color: Colors.gray600,
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  listContainerCompact: {
    paddingVertical: spacing.sm,
  },
  cardContainer: {
    marginHorizontal: "1%",
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    ...typography.body1,
    color: Colors.gray600,
    textAlign: "center",
  },
});

export default CategoryContentWrapper;
