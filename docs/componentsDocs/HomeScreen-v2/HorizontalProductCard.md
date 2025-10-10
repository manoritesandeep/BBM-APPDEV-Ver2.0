# HorizontalProductCard Component

## Overview

`HorizontalProductCard` is a unified, reusable horizontal product card component that provides a consistent product display experience across the entire application. It replaces the vertical `ProductCard` and `SearchResultCard` components to create a more cohesive and user-friendly browsing experience.

## Location

```
components/UI/HorizontalProductCard.js
```

## Features

### 🎨 Visual Design

- **Horizontal Layout**: Optimizes screen space and information density
- **Theme Aware**: Fully supports light/dark mode with dynamic theming
- **Responsive**: Adapts to different screen sizes and orientations
- **Consistent**: Unified design across all product listing screens

### 🚀 Performance

- **Memoized Component**: Uses React.memo to prevent unnecessary re-renders
- **Optimized Callbacks**: All callbacks are memoized with useCallback
- **Lazy Image Loading**: Efficient image rendering with fallback support
- **Smart Recalculation**: Product names and images cached with useMemo

### 🎯 Functionality

- **Product Groups**: Supports both single products and product variants
- **Size Selection**: Integrated CompactSizeSelector for variant selection
- **Add to Cart**: Built-in cart functionality with custom override support
- **Search Highlighting**: Optional search term highlighting in product names
- **Product Modal**: Opens detailed product view on card press

### ♿ Accessibility

- **Font Scaling**: All text supports dynamic font scaling
- **Localization**: Full i18n support for multi-language
- **Touch Targets**: Optimized touch areas for buttons
- **Screen Readers**: Proper accessibility labels

## Usage

### Basic Usage

```javascript
import HorizontalProductCard from "../components/UI/HorizontalProductCard";

<HorizontalProductCard productGroup={product} onPress={handleProductPress} />;
```

### Category Screen Usage

```javascript
// In CategoryScreen.js
<FlatList
  data={productGroups}
  renderItem={({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={handleProductPress}
      isLast={index === productGroups.length - 1}
      showCategory={false} // Already in category context
      showHSN={true}
    />
  )}
  ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
/>
```

### Search Results Usage

```javascript
// In SearchResultsScreen.js
<FlatList
  data={searchResults}
  renderItem={({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={handleProductPress}
      onAddToCart={handleAddToCart}
      searchQuery={searchQuery}
      isLast={index === searchResults.length - 1}
      showCategory={true} // Show category in search results
      showHSN={true}
    />
  )}
  ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
/>
```

## Props

| Prop           | Type            | Required | Default         | Description                                         |
| -------------- | --------------- | -------- | --------------- | --------------------------------------------------- |
| `productGroup` | `Object\|Array` | Yes      | -               | Single product or array of product variants         |
| `onPress`      | `Function`      | Yes      | -               | Callback when card is pressed                       |
| `onAddToCart`  | `Function`      | No       | Default handler | Custom add to cart handler                          |
| `searchQuery`  | `string`        | No       | `undefined`     | Search term for highlighting in product name        |
| `isLast`       | `boolean`       | No       | `false`         | Whether this is the last item in list (for spacing) |
| `showCategory` | `boolean`       | No       | `true`          | Whether to display category badge                   |
| `showHSN`      | `boolean`       | No       | `true`          | Whether to display HSN code                         |

## Product Object Structure

```javascript
{
  id: "product_123",
  productName: "Product Name",
  price: 299,
  discount: 50,
  imageUrl: "https://...",
  category: "Category Name",
  sizes: "500g",
  HSN: "12345678",
  rating: 4.5,
  brand: "Brand Name"
}
```

## Component Structure

```
HorizontalProductCard
├── Pressable (Card Container)
│   ├── Image Container
│   │   └── Product Image
│   └── Details Container
│       ├── Product Name (with optional highlighting)
│       ├── Meta Row
│       │   ├── Category Badge (optional)
│       │   └── HSN Code (optional)
│       ├── Size Selector (for product groups)
│       ├── Price & Rating Row
│       │   ├── Price (with optional discount)
│       │   └── Rating
│       └── Bottom Row
│           ├── Size Info (for single products)
│           └── Add to Cart Button
```

## Styling

The component uses dynamic theming with the following style sections:

- **Card**: Container with shadow, border, and theme-aware background
- **Image**: Fixed size (95x105) with rounded corners
- **Typography**: Responsive font sizes with proper hierarchy
- **Colors**: Theme-aware colors for light/dark mode
- **Spacing**: Consistent spacing using the spacing system

## Layout Calculations

```javascript
const cardWidth = screenWidth - spacing.md * 2; // Full width minus margins
const imageSize = scaleSize(95); // Fixed square image
const contentWidth = cardWidth - imageSize - spacing.lg * 2; // Remaining space
```

## Best Practices

### 1. Use in FlatList

```javascript
<FlatList
  data={products}
  renderItem={({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={handlePress}
      isLast={index === products.length - 1}
    />
  )}
  ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
/>
```

### 2. Handle Product Groups

```javascript
// Product groups are automatically handled
const productGroup = [
  { ...product, sizes: "500g" },
  { ...product, sizes: "1kg" },
  { ...product, sizes: "2kg" },
];

<HorizontalProductCard productGroup={productGroup} onPress={handlePress} />;
```

### 3. Custom Add to Cart

```javascript
const customAddToCart = (product) => {
  // Custom logic before adding to cart
  console.log("Adding:", product);
  addToCart(product, quantity);
  showCustomToast();
};

<HorizontalProductCard
  productGroup={product}
  onPress={handlePress}
  onAddToCart={customAddToCart}
/>;
```

### 4. Search Highlighting

```javascript
<HorizontalProductCard
  productGroup={product}
  onPress={handlePress}
  searchQuery="rice" // Highlights "rice" in product name
/>
```

## Migration Guide

### From ProductCard (Vertical)

**Before:**

```javascript
import ProductCard from "../components/HomeComponents/ProductCard";

<FlatList
  data={products}
  numColumns={2}
  columnWrapperStyle={styles.columnWrapper}
  renderItem={({ item }) => (
    <ProductCard productGroup={item} onPress={handlePress} />
  )}
/>;
```

**After:**

```javascript
import HorizontalProductCard from "../components/UI/HorizontalProductCard";

<FlatList
  data={products}
  // Remove numColumns and columnWrapperStyle
  ItemSeparatorComponent={() => <View style={styles.separator} />}
  renderItem={({ item, index }) => (
    <HorizontalProductCard
      productGroup={item}
      onPress={handlePress}
      isLast={index === products.length - 1}
    />
  )}
/>;
```

### From SearchResultCard

**Before:**

```javascript
import SearchResultCard from "../components/SearchComponents/SearchResultCard";

<SearchResultCard
  productGroup={item}
  onPress={handlePress}
  onAddToCart={handleAddToCart}
  searchQuery={query}
/>;
```

**After:**

```javascript
import HorizontalProductCard from "../components/UI/HorizontalProductCard";

<HorizontalProductCard
  productGroup={item}
  onPress={handlePress}
  onAddToCart={handleAddToCart}
  searchQuery={query}
  // Same props, same functionality!
/>;
```

## Performance Optimizations

1. **Memoization**: Component is wrapped with React.memo
2. **Callback Optimization**: All callbacks use useCallback
3. **Value Memoization**: Product names and images use useMemo
4. **Image Caching**: Images are cached by React Native
5. **List Virtualization**: Works efficiently with FlatList virtualization

## Related Components

- **CompactSizeSelector**: Used for variant selection
- **Button**: Used for Add to Cart action
- **ProductModal**: Opened when card is pressed
- **ToastProvider**: Shows add to cart confirmation

## Theme Support

The component automatically adapts to theme changes:

```javascript
const { colors, isDark } = useTheme();

// Colors adjust based on theme
backgroundColor: colors.card,
color: colors.text,
shadowOpacity: isDark ? 0.4 : 0.08,
```

## Localization

All text is localized using the i18n context:

```javascript
const { t } = useI18n();

// Translatable strings
t("common.add"); // Add button
t("common.size"); // Size label
```

## Benefits Over Previous Implementations

### ✅ Consistency

- Same design across Category, Search, and other product listings
- Unified user experience throughout the app

### ✅ Better UX

- Horizontal layout shows more information
- Better use of screen width
- Easier to scan and browse

### ✅ Maintainability

- Single component to maintain instead of multiple
- Changes propagate to all screens automatically
- Reduced code duplication

### ✅ Performance

- Optimized with memoization
- Efficient re-rendering
- Better memory usage

### ✅ Flexibility

- Configurable props for different contexts
- Optional features (category, HSN, search highlighting)
- Custom add to cart handling

## Future Enhancements

Potential improvements for future versions:

1. **Wishlist Integration**: Add wishlist button
2. **Quick View**: Inline product details expansion
3. **Swipe Actions**: Swipe gestures for quick actions
4. **Animations**: Smooth entrance/exit animations
5. **Skeleton Loading**: Loading state placeholder

## Troubleshooting

### Images Not Displaying

- Verify `imageUrl` is a valid URL
- Check placeholder image exists in assets
- Ensure network permissions are configured

### Add to Cart Not Working

- Verify CartContext is available
- Check product object has required fields
- Ensure ToastProvider wraps the component

### Theme Not Applying

- Verify ThemeProvider wraps the app
- Check colors object is properly defined
- Ensure isDark flag is being set

## Example Implementation

See complete working examples in:

- `/screens/CategoryScreen.js`
- `/screens/SearchResultsScreen.js`
- `/components/HomeComponents/CategoryModal.js`
