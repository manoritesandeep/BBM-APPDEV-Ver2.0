// Integration Example: How to add filtering to existing AllProducts screen
// This file shows the minimal changes needed to integrate the filtering system

import React, { useState, useContext } from "react";
import { View, FlatList, StyleSheet } from "react-native";

// Import the new filtering system
import { FilterContextProvider, useFilter } from "../store/filter-context";
import FilterPanel from "../components/Filters/FilterPanel";
import CompactFilterBar from "../components/Filters/CompactFilterBar";

// Your existing imports
import { ProductsContext } from "../store/products-context";
import ProductCard from "../components/Products/ProductCard";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";
import { groupProductsByName } from "../util/groupedProductsByName";
import { Colors } from "../constants/styles";
import { spacing } from "../constants/responsive";

// STEP 1: Create filtered content component (uses the filter context)
function AllProductsContentWithFilters() {
  // Replace your product list with filtered products
  const { filteredProducts } = useFilter(); // Instead of products from ProductsContext

  // Add filter panel state
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Group filtered products (same as before)
  const groupedProducts = groupProductsByName(filteredProducts);

  const handleProductPress = (productGroup) => {
    const product = Array.isArray(productGroup)
      ? productGroup[0]
      : productGroup;
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProductCard = ({ item }) => (
    <View style={styles.productContainer}>
      <ProductCard productGroup={item} onPress={handleProductPress} />
    </View>
  );

  // STEP 2: Add filter bar to your header (optional but recommended)
  const renderListHeader = () => (
    <CompactFilterBar
      onOpenFullFilter={() => setFilterPanelVisible(true)}
      showResultsCount={true}
      showSortButton={true}
      style={styles.filterBar}
    />
  );

  return (
    <SafeAreaWrapper style={styles.container}>
      <FlatList
        data={groupedProducts}
        renderItem={renderProductCard}
        keyExtractor={(item, index) => {
          const product = Array.isArray(item) ? item[0] : item;
          return product?.id ? product.id.toString() : `product-${index}`;
        }}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderListHeader} // Add this line
        showsVerticalScrollIndicator={false}
      />

      {/* STEP 3: Add filter panel modal */}
      <FilterPanel
        visible={filterPanelVisible}
        onClose={() => setFilterPanelVisible(false)}
        showCategorySelector={true}
      />

      {/* Your existing product modal */}
      {/* <ProductModal ... /> */}
    </SafeAreaWrapper>
  );
}

// STEP 4: Wrap your existing screen with FilterContextProvider
function AllProductsScreenWithFilters() {
  const { products, loading } = useContext(ProductsContext);

  if (loading) {
    return (
      <SafeAreaWrapper>
        <LoadingOverlay>Loading products...</LoadingOverlay>
      </SafeAreaWrapper>
    );
  }

  return (
    <FilterContextProvider products={products}>
      <AllProductsContentWithFilters />
    </FilterContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  filterBar: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  productContainer: {
    flex: 1,
    padding: spacing.xs,
  },
});

export default AllProductsScreenWithFilters;

/* 
INTEGRATION SUMMARY:

1. Wrap your screen component with FilterContextProvider
2. Replace `products` with `filteredProducts` from useFilter hook
3. Add CompactFilterBar to your list header
4. Add FilterPanel modal
5. That's it! Your screen now has intelligent filtering

MINIMAL CHANGES NEEDED:
- Import FilterContextProvider and useFilter
- Add 2-3 state variables for modals
- Add FilterPanel and CompactFilterBar components
- Replace product source with filteredProducts

The filtering system handles all the complex logic:
- Category-aware filters
- Real-time filtering
- Smart suggestions
- Performance optimization
- Mobile-responsive design
*/
