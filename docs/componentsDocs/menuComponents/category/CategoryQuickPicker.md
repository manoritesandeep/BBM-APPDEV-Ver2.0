# CategoryQuickPicker Component Documentation

## Overview

The `CategoryQuickPicker` component provides a horizontal, scrollable category picker designed for the home screen. It offers users quick access to popular categories without navigating to the full menu system.

## Location

`components/MenuComponents/CategoryComponents/CategoryQuickPicker.js`

## Component Signature

```javascript
const CategoryQuickPicker = () => {
  // Component implementation
};
```

## Features

### Horizontal Scrolling

- **Smooth Scrolling**: Optimized horizontal FlatList with smooth touch interactions
- **No Indicators**: Clean appearance without scroll indicators
- **Touch-Friendly**: Proper spacing for mobile touch interaction

### Quick Access

- **Home Screen Integration**: Positioned prominently on home screen
- **Popular Categories**: Shows most relevant categories for quick browsing
- **Instant Navigation**: Direct navigation to filtered product views

### Performance Optimized

- **Compact Cards**: Uses compact mode of CategoryCard for efficient rendering
- **Memoized Rendering**: Prevents unnecessary re-renders
- **Efficient Scrolling**: Optimized FlatList configuration

## Data Integration

### Product Context Integration

```javascript
const { products } = useContext(ProductsContext);
```

The component integrates with the ProductsContext to:

- Calculate real-time product counts per category
- Extract top brands for each category
- Handle loading and error states

### Category Processing

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

## Navigation Implementation

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

1. **User Interaction**: User taps on a category card
2. **Parameter Passing**: Navigation includes both category value and display name
3. **Screen Transition**: Navigates to AllProductsScreen with category filter
4. **Automatic Filtering**: Target screen applies category filter on load

## Component Structure

### Main Component

```javascript
const CategoryQuickPicker = () => {
  const navigation = useNavigation();
  const { products } = useContext(ProductsContext);

  // Data processing
  const enrichedCategories = useMemo(() => {
    // Category enrichment logic
  }, [products]);

  // Navigation handler
  const handleCategoryPress = useCallback(
    (category) => {
      // Navigation logic
    },
    [navigation]
  );

  // Render function
  const renderCategoryItem = useCallback(
    ({ item }) => (
      <CategoryCard
        category={item}
        productCount={item.productCount}
        topBrands={item.topBrands}
        onPress={() => handleCategoryPress(item)}
        compact={true}
      />
    ),
    [handleCategoryPress]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by Category</Text>
      <FlatList
        data={enrichedCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.value}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};
```

## Usage Examples

### Home Screen Integration

```javascript
import CategoryQuickPicker from "../MenuComponents/CategoryComponents/CategoryQuickPicker";

function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome to Build Bharat Mart</Text>
      </View>

      {/* Category Quick Picker */}
      <CategoryQuickPicker />

      {/* Other Home Content */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        {/* Featured products */}
      </View>
    </ScrollView>
  );
}
```

### Conditional Rendering

```javascript
function HomeScreenContent({ showCategories = true }) {
  return (
    <View style={styles.container}>
      <WelcomeMessage />

      {showCategories && <CategoryQuickPicker />}

      <FeaturedProducts />
      <SpecialOffers />
    </View>
  );
}
```

### Custom Styling

```javascript
function CustomCategoryPicker() {
  return (
    <View style={[styles.container, { backgroundColor: "#f8f9fa" }]}>
      <Text style={[styles.title, { color: "#333", fontSize: 18 }]}>
        Shop by Category
      </Text>
      <CategoryQuickPicker />
    </View>
  );
}
```

## Styling

### Container Styles

```javascript
const styles = StyleSheet.create({
  container: {
    marginVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(2),
  },
  title: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: responsiveHeight(1.5),
    marginLeft: responsiveWidth(2),
  },
  listContainer: {
    paddingHorizontal: responsiveWidth(1),
  },
});
```

### Responsive Design

The component adapts to different screen sizes:

```javascript
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "../../constants/responsive";

// Title sizing
fontSize: responsiveFontSize(2.2);

// Container margins
marginVertical: responsiveHeight(2);
marginBottom: responsiveHeight(1.5);

// Horizontal spacing
paddingHorizontal: responsiveWidth(2);
```

## Performance Optimization

### Memoization Strategy

```javascript
// Memoized category processing
const enrichedCategories = useMemo(() => {
  // Processing logic only runs when products change
}, [products]);

// Memoized event handlers
const handleCategoryPress = useCallback(
  (category) => {
    // Stable reference prevents unnecessary re-renders
  },
  [navigation]
);

// Memoized render function
const renderCategoryItem = useCallback(
  ({ item }) => <CategoryCard /* ... */ />,
  [handleCategoryPress]
);
```

### FlatList Optimization

```javascript
<FlatList
  data={enrichedCategories}
  renderItem={renderCategoryItem}
  keyExtractor={(item) => item.value}
  horizontal={true}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.listContainer}
  // Performance optimizations
  initialNumToRender={5}
  maxToRenderPerBatch={3}
  windowSize={7}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  })}
/>
```

## Loading States

### Handling Empty Data

```javascript
const enrichedCategories = useMemo(() => {
  if (!products || products.length === 0) {
    // Return categories with zero counts during loading
    return CATEGORIES.map((category) => ({
      ...category,
      productCount: 0,
      topBrands: [],
    }));
  }

  // Normal processing when products are available
  return processCategories(products);
}, [products]);
```

### Loading Indicator

```javascript
function CategoryQuickPicker() {
  const { products, isLoading } = useContext(ProductsContext);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Browse by Category</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    // Normal component rendering
  );
}
```

## Integration Points

### Home Screen Integration

The component is integrated into the home screen flow:

1. **Positioning**: Appears after welcome message, before featured content
2. **Spacing**: Consistent margins with other home screen sections
3. **Navigation**: Seamless transition to product browsing

### ProductsContext Dependency

```javascript
// Required context provider at app level
<ProductsContextProvider>
  <HomeScreen />
</ProductsContextProvider>
```

### Navigation Dependency

```javascript
// Requires navigation structure with AllProductsScreen
const navigation = useNavigation();

// Target screen must exist in navigator
navigation.navigate("AllProductsScreen", {
  category: category.value,
  categoryName: category.name,
});
```

## Testing

### Unit Tests

```javascript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ProductsContext } from "../../store/products-context";
import CategoryQuickPicker from "../CategoryQuickPicker";

describe("CategoryQuickPicker", () => {
  const mockProducts = [
    { id: 1, category: "PAINTS", brand: "Asian Paints" },
    { id: 2, category: "HARDWARE", brand: "Godrej" },
  ];

  const renderWithContext = (products = mockProducts) => {
    return render(
      <ProductsContext.Provider value={{ products }}>
        <CategoryQuickPicker />
      </ProductsContext.Provider>
    );
  };

  test("renders category picker with title", () => {
    const { getByText } = renderWithContext();
    expect(getByText("Browse by Category")).toBeTruthy();
  });

  test("displays categories horizontally", () => {
    const { getByTestId } = renderWithContext();
    const flatList = getByTestId("category-flatlist");
    expect(flatList.props.horizontal).toBe(true);
  });

  test("navigates on category press", async () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(require("@react-navigation/native"), "useNavigation")
      .mockReturnValue({ navigate: mockNavigate });

    const { getByText } = renderWithContext();

    fireEvent.press(getByText("Paints"));

    expect(mockNavigate).toHaveBeenCalledWith("AllProductsScreen", {
      category: "PAINTS",
      categoryName: "Paints",
    });
  });
});
```

### Performance Tests

```javascript
test("handles large product datasets efficiently", () => {
  const largeProductSet = generateMockProducts(1000);

  const { getByTestId } = renderWithContext(largeProductSet);

  // Should render without performance issues
  expect(getByTestId("category-flatlist")).toBeTruthy();

  // Should process data quickly
  const categories = getByTestId("category-flatlist").props.data;
  expect(categories).toHaveLength(CATEGORIES.length);
});
```

## Troubleshooting

### Common Issues

#### Categories Not Appearing

**Problem**: CategoryQuickPicker shows empty or doesn't render categories  
**Solution**: Check ProductsContext provider and data structure

```javascript
// Ensure context is provided at app level
<ProductsContextProvider>
  <App />
</ProductsContextProvider>;

// Check products data structure
console.log("Products data:", products);
```

#### Navigation Not Working

**Problem**: Tapping categories doesn't navigate  
**Solution**: Verify navigation setup and screen names

```javascript
// Check navigation stack includes target screen
const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AllProductsScreen" component={AllProducts} />
      {/* Other screens */}
    </Stack.Navigator>
  );
}
```

#### Performance Issues

**Problem**: Sluggish horizontal scrolling  
**Solution**: Verify FlatList optimization and memoization

```javascript
// Ensure proper memoization
const renderCategoryItem = useCallback(
  ({ item }) => (
    <CategoryCard
      category={item}
      productCount={item.productCount}
      topBrands={item.topBrands}
      onPress={() => handleCategoryPress(item)}
      compact={true}
    />
  ),
  [handleCategoryPress]
); // Stable dependency
```

### Debug Helpers

```javascript
// Add debug logging
console.log("CategoryQuickPicker render:", {
  productsCount: products?.length || 0,
  categoriesCount: enrichedCategories.length,
  isLoading: !products,
});

// Performance timing
const startTime = performance.now();
const processedCategories = processCategories(products);
const endTime = performance.now();
console.log(`Category processing took ${endTime - startTime}ms`);
```

## Future Enhancements

### Planned Features

1. **Category Filtering**: Show only categories with products
2. **Popular Categories**: Display most-browsed categories first
3. **Animations**: Add smooth entrance and scrolling animations
4. **Customization**: Allow hiding/showing specific categories
5. **Analytics**: Track category interaction for insights

### Extension Ideas

1. **Category Badges**: Show "New" or "Popular" badges
2. **Seasonal Categories**: Highlight seasonal or trending items
3. **User Preferences**: Remember frequently accessed categories
4. **Search Integration**: Quick search within selected category

## Dependencies

- `react-native`: Core React Native components
- `react`: React hooks and context
- `@react-navigation/native`: Navigation functionality
- `../../constants/responsive`: Responsive design utilities
- `../../constants/styles`: Styling constants
- `../../store/products-context`: Product data access
- `../../../data/dummy-data`: Category definitions
- `./CategoryCard`: Individual category card component

## Related Components

- `CategoryCard`: Renders individual category cards
- `CategoryContent`: Full-screen category browser
- `HomeScreenOutput`: Home screen integration
- `AllProducts`: Navigation target for category filtering
