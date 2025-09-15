import React, { useContext, useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CategoryCard from "./CategoryCard";
import { ProductsContext } from "../../../store/products-context";
import { Colors } from "../../../constants/styles";
import { spacing, typography, scaleSize } from "../../../constants/responsive";

// Category configuration for horizontal display
const CATEGORIES = [
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
    name: "Tiles",
    value: "TILES",
    icon: "square-outline",
    color: "#DDA0DD",
  },
  {
    name: "Sanitary",
    value: "SANITARY ACCESSORIES",
    icon: "water-outline",
    color: "#87CEEB",
  },
];

function CategoryQuickPicker() {
  const navigation = useNavigation();
  const { products } = useContext(ProductsContext);

  // Memoized category data with product counts
  const enrichedCategories = useMemo(() => {
    if (!products || products.length === 0) {
      return CATEGORIES.map((category) => ({
        ...category,
        productCount: 0,
      }));
    }

    return CATEGORIES.map((category) => {
      const categoryProducts = products.filter(
        (product) => product.category === category.value
      );

      return {
        ...category,
        productCount: categoryProducts.length,
      };
    });
  }, [products]);

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
      <View style={styles.cardWrapper}>
        <CategoryCard
          category={item}
          productCount={item.productCount}
          onPress={handleCategoryPress}
          compact={true}
          style={styles.compactCard}
        />
      </View>
    ),
    [handleCategoryPress]
  );

  const keyExtractor = useCallback((item) => item.value || item.name, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop by Category</Text>

      <FlatList
        data={enrichedCategories}
        renderItem={renderCategoryCard}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={7}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading4,
    color: Colors.gray900,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
  },
  cardWrapper: {
    width: scaleSize(120),
    marginHorizontal: spacing.xs * 0.5,
  },
  compactCard: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
});

export default CategoryQuickPicker;
