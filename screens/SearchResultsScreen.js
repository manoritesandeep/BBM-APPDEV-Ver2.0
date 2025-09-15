import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useSearch } from "../store/search-context";
import { ProductsContext } from "../store/products-context";
import { CartContext } from "../store/cart-context";
import { searchProducts } from "../util/searchUtils";
import { groupProductsByName } from "../util/groupedProductsByName";
import SearchResultCard from "../components/SearchComponents/SearchResultCard";
import { Colors } from "../constants/styles";
import { spacing, layout } from "../constants/responsive";
import { formatProductName } from "../util/formatProductName";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";
import { useToast } from "../components/UI/ToastProvider";
import DeliveryAddressSection from "../components/SearchComponents/DeliveryAddressSection";

// Import the advanced filtering system
import { FilterContextProvider, useFilter } from "../store/filter-context";
import FilterPanel from "../components/Filters/FilterPanel";
import CompactFilterBar from "../components/Filters/CompactFilterBar";

// Enhanced SearchResultsScreen content with filtering capabilities
function SearchResultsScreenContent() {
  const navigation = useNavigation();
  const {
    searchQuery,
    searchResults,
    isSearching,
    setSearchResults,
    setIsSearching,
  } = useSearch();
  const { products } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  const { showToast } = useToast();

  // Use filtered products from the search results
  const { filteredProducts, appliedFiltersCount } = useFilter();

  // Group the filtered search results for display
  const displayResults = groupProductsByName(filteredProducts);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      setIsSearching(true);

      // Simulate slight delay for better UX
      const searchTimeout = setTimeout(() => {
        const results = searchProducts(searchQuery, products, true, 50);
        // Group products by name to combine same products with different sizes
        const groupedResults = groupProductsByName(results);
        setSearchResults(groupedResults);
        setIsSearching(false);
      }, 100);

      return () => clearTimeout(searchTimeout);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, products, setSearchResults, setIsSearching]);

  // Filter handlers
  const handleOpenFilter = () => {
    setFilterPanelVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterPanelVisible(false);
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    // You can navigate to product detail or open modal here
    // For now, we'll just log it
    console.log("Selected product:", product.productName);
  };

  const handleAddToCart = (product) => {
    // Clean product data to avoid nested arrays in Firestore
    const cleanProduct = {
      id: product.id,
      productName: product.productName,
      price: product.price,
      discount: product.discount || 0,
      imageUrl: product.imageUrl,
      category: product.category,
      sizes: product.sizes,
      HSN: product.HSN,
      rating: product.rating,
      brand: product.brand,
    };

    addToCart(cleanProduct, 1);
    const formattedProductName = formatProductName(product.productName);
    showToast(`${formattedProductName} added to cart`, "success");
  };

  const renderSearchResult = ({ item, index }) => (
    <SearchResultCard
      productGroup={item}
      onPress={handleProductPress}
      onAddToCart={handleAddToCart}
      searchQuery={searchQuery}
      isLast={index === searchResults.length - 1}
    />
  );

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.accent500} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={64} color={Colors.gray400} />
          <Text style={styles.emptyTitle}>Start typing to search</Text>
          <Text style={styles.emptySubtitle}>
            Find products by name, category, or HSN code
          </Text>
        </View>
      );
    }

    if (displayResults.length === 0 && searchResults.length > 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="funnel-outline" size={64} color={Colors.gray400} />
          <Text style={styles.emptyTitle}>No results match your filters</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filter criteria
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="sad-outline" size={64} color={Colors.gray400} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary100}
    >
      <View style={styles.container}>
        <DeliveryAddressSection />

        {searchResults.length > 0 && (
          <>
            {/* Smart Filter Bar - Show when search results exist */}
            <View style={styles.filterContainer}>
              <CompactFilterBar
                onOpenFullFilter={handleOpenFilter}
                showResultsCount={true}
                showSortButton={true}
                style={styles.filterBar}
              />
            </View>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {displayResults.length} result
                {displayResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                {appliedFiltersCount > 0 && (
                  <Text style={styles.filterInfo}>
                    {" "}
                    • {appliedFiltersCount} filter
                    {appliedFiltersCount !== 1 ? "s" : ""} applied
                  </Text>
                )}
              </Text>
            </View>
          </>
        )}

        {displayResults.length > 0 ? (
          <FlatList
            data={displayResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            getItemLayout={(data, index) => ({
              length: 160, // Increased height to account for the Add to Cart button
              offset: 160 * index,
              index,
            })}
          />
        ) : (
          renderEmptyState()
        )}

        {/* Advanced Filter Panel Modal */}
        <FilterPanel
          visible={filterPanelVisible}
          onClose={handleCloseFilter}
          showCategorySelector={true}
          compactMode={false}
        />
      </View>
    </SafeAreaWrapper>
  );
}

// Main SearchResultsScreen wrapper with Filter Context Provider
function SearchResultsScreen() {
  const { searchResults } = useSearch();

  // Flatten the grouped search results for filtering
  const flattenedResults = searchResults.reduce((acc, group) => {
    if (Array.isArray(group)) {
      return [...acc, ...group];
    } else {
      return [...acc, group];
    }
  }, []);

  return (
    <FilterContextProvider products={flattenedResults || []}>
      <SearchResultsScreenContent />
    </FilterContextProvider>
  );
}

export default SearchResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: "500",
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: 4,
  },
  filterBar: {
    marginHorizontal: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: "500",
  },
  filterInfo: {
    color: Colors.accent600,
    fontWeight: "600",
  },
  listContainer: {
    padding: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray600,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray700,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
