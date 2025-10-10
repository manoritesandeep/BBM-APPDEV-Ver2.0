# CategoryContent Component Documentation

## Overview

The `CategoryContent` component provides a full-screen category browser designed for the menu system. It displays all available categories in a responsive grid layout with real-time product counts and performance optimizations.

## Location

`components/MenuComponents/CategoryComponents/CatergoryContent.js`

## Component Signature

```javascript
const CatergoryContent = ({ compact = false }) => {
  // Component implementation with FilterContextProvider wrapper
};
```

## Props

| Prop      | Type    | Required | Default | Description                                                |
| --------- | ------- | -------- | ------- | ---------------------------------------------------------- |
| `compact` | Boolean | No       | false   | Whether to show compact layout (currently not implemented) |

## Architecture

The component consists of two main parts:

1. **CategoryContentCore**: The main component logic and rendering
2. **CategoryContentWrapper**: Wrapper that provides FilterContextProvider

```javascript
const CatergoryContent = ({ compact = false }) => (
  <FilterContextProvider>
    <CategoryContentCore compact={compact} />
  </FilterContextProvider>
);
```

## Features

### Grid Layout

- **Responsive Columns**: Automatically adjusts columns based on orientation
- **Even Spacing**: Consistent spacing between cards
- **Portrait/Landscape**: Optimized for both orientations

### Real-time Data

- **Live Product Counts**: Shows current number of products per category
- **Top Brands**: Displays popular brands for each category
- **Loading States**: Handles product loading gracefully

### Performance Optimization

- **Memoization**: Prevents unnecessary recalculations
- **List Virtualization**: Efficient rendering of large category lists
- **Debounced Updates**: Smooth updates during data changes

## Data Processing

### Category Enrichment

The component processes raw category data to add contextual information:

```javascript
const enrichedCategories = useMemo(() => {
  if (!products || products.length === 0) {
    return CATEGORIES.map((category) => ({
      ...category,
      productCount: 0,
      topBrands: [],
    }));
  }

  return CATEGORIES.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.category === category.value
    );

    const productCount = categoryProducts.length;
    const brandCounts = {};

    categoryProducts.forEach((product) => {
      const brand = product.brand || "Unknown";
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
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
```

### Brand Analysis

The component analyzes product data to extract top brands per category:

1. **Brand Counting**: Counts products per brand within each category
2. **Sorting**: Orders brands by product count (descending)
3. **Top Selection**: Takes top 3 brands for display

## Layout Configuration

### Grid Calculation

```javascript
const screenData = Dimensions.get("window");
const isLandscape = screenData.width > screenData.height;
const numColumns = isLandscape ? 3 : 2;
```

### Item Layout Optimization

```javascript
const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * Math.floor(index / numColumns),
  index,
});
```

## Navigation Integration

### Category Selection Handler

```javascript
const handleCategoryPress = useCallback(
  (category) => {
    navigation.navigate("AllProductsScreen", {
      category: category.value,
      categoryName: category.name,
    });
  },
  [navigation]
);
```

### Navigation Flow

1. User taps category card
2. Navigation to `AllProductsScreen` with parameters
3. Parameters include both `category` (value) and `categoryName` (display name)
4. Target screen applies category filter automatically

## Usage Examples

### Basic Implementation

```javascript
import CatergoryContent from "../CategoryComponents/CatergoryContent";

function MenuScreen() {
  return (
    <View style={styles.container}>
      <CatergoryContent />
    </View>
  );
}
```

### Conditional Rendering in Menu

```javascript
function MenuContent({ selected }) {
  return (
    <View style={styles.menuContainer}>
      {selected === "categories" && <CatergoryContent />}
      {selected === "offers" && <OffersContent />}
      {selected === "customer-care" && <CustomerCareContent />}
    </View>
  );
}
```

### Integration with Loading States

```javascript
function CategoryMenu({ isLoading }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <CatergoryContent />;
}
```

## Performance Considerations

### Memory Management

- **Efficient Filtering**: Uses native Array methods for optimal performance
- **Memoized Calculations**: Prevents redundant data processing
- **Cleanup**: Proper cleanup of event listeners and subscriptions

### Rendering Optimization

```javascript
const renderCategoryItem = useCallback(
  ({ item }) => (
    <CategoryCard
      category={item}
      productCount={item.productCount}
      topBrands={item.topBrands}
      onPress={() => handleCategoryPress(item)}
    />
  ),
  [handleCategoryPress]
);
```

### FlatList Configuration

```javascript
<FlatList
  data={enrichedCategories}
  renderItem={renderCategoryItem}
  numColumns={numColumns}
  key={`${numColumns}-${orientation}`}
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
  getItemLayout={getItemLayout}
  initialNumToRender={6}
  maxToRenderPerBatch={4}
  windowSize={10}
  removeClippedSubviews={true}
/>
```

## Error Handling

### Fallback States

```javascript
// When no products are loaded
if (!products || products.length === 0) {
  return CATEGORIES.map((category) => ({
    ...category,
    productCount: 0,
    topBrands: [],
  }));
}

// When category has no products
const productCount = categoryProducts.length;
if (productCount === 0) {
  return {
    ...category,
    productCount: 0,
    topBrands: [],
  };
}
```

### Loading States

The component handles various loading states gracefully:

- **Initial Load**: Shows categories with zero counts
- **Product Loading**: Updates counts as products load
- **Network Issues**: Maintains last known state

## Styling

### Container Styles

```javascript
const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(2),
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(5),
  },
});
```

### Responsive Design

The component uses responsive utilities for consistent appearance:

```javascript
import { responsiveWidth, responsiveHeight } from "../../constants/responsive";

// Applied to grid spacing and card dimensions
const cardMargin = responsiveWidth(1);
const gridPadding = responsiveWidth(2);
```

## Integration Points

### Context Dependencies

1. **ProductsContext**: For accessing product data

   ```javascript
   const { products } = useContext(ProductsContext);
   ```

2. **FilterContextProvider**: Wraps component for filter system integration
   ```javascript
   const CatergoryContent = ({ compact = false }) => (
     <FilterContextProvider>
       <CategoryContentCore compact={compact} />
     </FilterContextProvider>
   );
   ```

### Navigation Dependencies

- **React Navigation**: For screen transitions
- **Tab Navigator**: Integration with existing navigation structure

## Testing

### Unit Tests

```javascript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ProductsContext } from "../../store/products-context";
import CatergoryContent from "../CatergoryContent";

describe("CatergoryContent", () => {
  const mockProducts = [
    { id: 1, category: "PAINTS", brand: "Asian Paints" },
    { id: 2, category: "PAINTS", brand: "Berger" },
    { id: 3, category: "HARDWARE", brand: "Godrej" },
  ];

  const MockedComponent = ({ products }) => (
    <ProductsContext.Provider value={{ products }}>
      <CatergoryContent />
    </ProductsContext.Provider>
  );

  test("displays categories with product counts", async () => {
    const { getByText } = render(<MockedComponent products={mockProducts} />);

    await waitFor(() => {
      expect(getByText("Paints")).toBeTruthy();
      expect(getByText("2 products")).toBeTruthy();
    });
  });

  test("navigates to products on category press", async () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(<MockedComponent products={mockProducts} />);

    fireEvent.press(getByText("Paints"));

    expect(mockNavigate).toHaveBeenCalledWith("AllProductsScreen", {
      category: "PAINTS",
      categoryName: "Paints",
    });
  });
});
```

### Performance Testing

```javascript
import { performance } from "perf_hooks";

test("category processing performance", () => {
  const largeProductSet = generateMockProducts(1000);

  const start = performance.now();
  const result = processCategoryData(largeProductSet);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // Should process in < 100ms
  expect(result).toHaveLength(CATEGORIES.length);
});
```

## Troubleshooting

### Common Issues

#### Categories Not Updating

**Problem**: Product counts don't update when products change  
**Solution**: Check ProductsContext provider and useMemo dependencies

```javascript
// Ensure proper dependencies
const enrichedCategories = useMemo(() => {
  // ... processing logic
}, [products]); // Should depend on products array
```

#### Performance Issues

**Problem**: Sluggish scrolling or high memory usage  
**Solution**: Verify FlatList optimization settings

```javascript
// Ensure these props are set
<FlatList
  removeClippedSubviews={true}
  initialNumToRender={6}
  maxToRenderPerBatch={4}
  windowSize={10}
  getItemLayout={getItemLayout}
/>
```

#### Navigation Errors

**Problem**: Category press doesn't navigate properly  
**Solution**: Verify screen name and navigation structure

```javascript
// Check that screen name matches navigator configuration
navigation.navigate("AllProductsScreen", {
  // Exact name from navigator
  category: category.value,
  categoryName: category.name,
});
```

### Debug Tools

1. **Console Logging**: Add temporary logs for data flow tracking
2. **React Developer Tools**: Inspect component state and props
3. **Performance Monitor**: Check rendering performance

```javascript
// Debug logging example
console.log("Category data processed:", {
  totalCategories: enrichedCategories.length,
  totalProducts: products?.length || 0,
  processingTime: performance.now() - startTime,
});
```

## Future Enhancements

### Planned Features

1. **Search Functionality**: Add search within categories
2. **Sorting Options**: Sort by name, product count, popularity
3. **Filter Integration**: Filter categories by various criteria
4. **Animations**: Add smooth transitions and loading animations
5. **Caching**: Implement category data caching for offline use

### Extension Points

1. **Custom Layouts**: Support for different grid layouts
2. **Category Analytics**: Track category interaction metrics
3. **Dynamic Categories**: Support for server-defined categories
4. **Subcategory Support**: Hierarchical category browsing

## Dependencies

- `react-native`: Core React Native components
- `react`: React hooks and utilities
- `react-navigation`: Navigation system
- `../../constants/responsive`: Responsive design utilities
- `../../constants/styles`: Global styling constants
- `../../store/products-context`: Product data context
- `../../store/filter-context`: Filter system integration
- `../../../data/dummy-data`: Category definitions

## Related Components

- `CategoryCard`: Individual category card component
- `CategoryQuickPicker`: Horizontal category picker
- `MenuContent`: Menu system integration
- `ProductsOutput`: Target for category navigation
