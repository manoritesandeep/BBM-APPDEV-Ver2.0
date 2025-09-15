import { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";

import ProductList from "./ProductList";
import LoadingState from "../UI/LoadingState";
import { groupProductsByName } from "../../util/groupedProductsByName";
import { Colors } from "../../constants/styles";
import { ProductsContext } from "../../store/products-context";
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";
import DeliveryAddressSection from "../SearchComponents/DeliveryAddressSection";
import { ResponsiveContainer } from "../UI/ResponsiveGrid";
import { layout, spacing } from "../../constants/responsive";

// Import the advanced filtering system
import { FilterContextProvider, useFilter } from "../../store/filter-context";
import FilterPanel from "../Filters/FilterPanel";
import CompactFilterBar from "../Filters/CompactFilterBar";

// will add as a future feature
// import CategoryQuickPicker from "../MenuComponents/CategoryComponents/CategoryQuickPicker";

// Enhanced ProductsOutput content with filtering capabilities
function ProductsOutputContent() {
  const { loading, error, refreshProducts } = useContext(ProductsContext);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);

  // Use filtered products instead of raw products
  const { filteredProducts, appliedFiltersCount } = useFilter();

  // Group the filtered products for display
  const groupedProducts = groupProductsByName(filteredProducts);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProducts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenFilter = () => {
    setFilterPanelVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterPanelVisible(false);
  };

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary100}
    >
      <ResponsiveContainer maxWidth={1200}>
        <View style={styles.container}>
          {/* <DeliveryAddressSection /> */}

          {/* Smart Filter Bar - Always visible when products are loaded */}
          {!loading && !error && (
            <View style={styles.filterContainer}>
              <CompactFilterBar
                onOpenFullFilter={handleOpenFilter}
                showResultsCount={true}
                showSortButton={true}
                style={styles.filterBar}
              />
              {/* <CategoryQuickPicker /> */}
            </View>
          )}

          {loading ? (
            <LoadingState
              type="skeleton-products"
              count={6}
              fullScreen={false}
            />
          ) : error ? (
            <LoadingState
              message="Failed to load products. Pull to refresh and try again."
              fullScreen={false}
            />
          ) : (
            <ProductList
              products={groupedProducts}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          )}

          {/* Advanced Filter Panel Modal */}
          <FilterPanel
            visible={filterPanelVisible}
            onClose={handleCloseFilter}
            showCategorySelector={true}
            compactMode={false}
          />
        </View>
      </ResponsiveContainer>
    </SafeAreaWrapper>
  );
}

// Main ProductsOutput wrapper with Filter Context Provider
function ProductsOutput() {
  const { products } = useContext(ProductsContext);

  return (
    <FilterContextProvider products={products || []}>
      <ProductsOutputContent />
    </FilterContextProvider>
  );
}

export default ProductsOutput;

const styles = StyleSheet.create({
  container: {
    ...layout.flex,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: spacing.xs,
  },
  filterBar: {
    marginHorizontal: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
