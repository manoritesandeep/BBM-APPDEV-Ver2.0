# CategoryCard Component Documentation

## Overview

The `CategoryCard` component is a reusable card UI element that displays category information with modern design and interactive functionality. It's used across multiple screens to provide consistent category representation.

## Location

`components/MenuComponents/CategoryComponents/CategoryCard.js`

## Component Signature

```javascript
const CategoryCard = ({
  category,
  productCount = 0,
  topBrands = [],
  onPress,
  compact = false,
  style,
}) => {
  // Component implementation
};
```

## Props

| Prop           | Type     | Required | Default | Description                                                               |
| -------------- | -------- | -------- | ------- | ------------------------------------------------------------------------- |
| `category`     | Object   | Yes      | -       | Category data object containing name, value, icon, color, and description |
| `productCount` | Number   | No       | 0       | Number of products available in this category                             |
| `topBrands`    | Array    | No       | []      | Array of top brand names for this category                                |
| `onPress`      | Function | No       | -       | Callback function when card is pressed                                    |
| `compact`      | Boolean  | No       | false   | Whether to render compact version for horizontal lists                    |
| `style`        | Object   | No       | -       | Additional styles to apply to the card container                          |

### Category Object Structure

```javascript
const category = {
  name: "Paints", // Display name
  value: "PAINTS", // Internal value for filtering
  icon: "color-palette", // Ionicon name
  color: "#FF6B6B", // Hex color for theming
  description: "Wall and wood paints", // Brief description
};
```

## Features

### Visual Design

- **Modern Card Layout**: Clean, professional appearance with shadow effects
- **Category-Specific Colors**: Dynamic theming based on category color
- **Icon Integration**: Ionicons for visual category identification
- **Responsive Design**: Adapts to different screen sizes using responsive utilities

### Interactive Elements

- **Touch Feedback**: Visual feedback on press with opacity changes
- **Accessibility**: Proper accessibility labels and roles
- **Loading States**: Graceful handling of missing data

### Information Display

- **Product Count Badge**: Shows number of available products
- **Top Brands**: Displays up to 3 top brands as subtitle
- **Category Description**: Brief description of category contents

## Usage Examples

### Basic Usage

```javascript
import CategoryCard from "../CategoryComponents/CategoryCard";

function CategoryList({ categories, onCategorySelect }) {
  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          productCount={item.productCount}
          topBrands={item.topBrands}
          onPress={() => onCategorySelect(item)}
        />
      )}
      keyExtractor={(item) => item.value}
    />
  );
}
```

### Compact Mode for Horizontal Lists

```javascript
function CategoryQuickPicker({ categories }) {
  return (
    <FlatList
      horizontal
      data={categories}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          productCount={item.productCount}
          topBrands={item.topBrands}
          compact={true}
          onPress={() => navigateToCategory(item)}
        />
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}
```

### Custom Styling

```javascript
function CustomCategoryCard({ category }) {
  return (
    <CategoryCard
      category={category}
      productCount={category.productCount}
      topBrands={category.topBrands}
      style={{
        marginHorizontal: 10,
        borderRadius: 15,
        elevation: 8,
      }}
      onPress={() => handleCategoryPress(category)}
    />
  );
}
```

## Styling

### Base Styles

The component uses a combination of base styles and dynamic styling:

```javascript
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 8,
    overflow: "hidden",
  },
  // ... additional styles
});
```

### Dynamic Color Theming

The card automatically applies category-specific colors:

```javascript
// Header background uses category color with opacity
const headerStyle = {
  backgroundColor: `${category.color}20`, // 20% opacity
  borderBottomColor: category.color,
  borderBottomWidth: 2,
};

// Icon uses full category color
const iconStyle = {
  color: category.color,
};
```

### Responsive Dimensions

The component adapts to screen size:

```javascript
// Uses responsive utility functions
const cardWidth = compact ? responsiveWidth(40) : responsiveWidth(85);

const iconSize = compact ? responsiveHeight(3) : responsiveHeight(4);
```

## Performance Considerations

### Memoization

The component uses React.memo for performance optimization:

```javascript
const CategoryCard = React.memo(
  ({ category, productCount, topBrands, onPress, compact, style }) => {
    // Component implementation
  }
);
```

### Subtitle Generation

Top brands subtitle is generated efficiently:

```javascript
const subtitle = useMemo(() => {
  if (!topBrands || topBrands.length === 0) {
    return `${productCount} products available`;
  }

  const brandsText = topBrands.slice(0, 3).join(" • ");
  return productCount > 0
    ? `${brandsText} • ${productCount} products`
    : brandsText;
}, [topBrands, productCount]);
```

## Accessibility

The component includes proper accessibility support:

```javascript
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={`${category.name} category`}
  accessibilityHint={`Browse ${productCount} products in ${category.name}`}
  onPress={onPress}
>
  {/* Card content */}
</TouchableOpacity>
```

## Testing

### Unit Test Examples

```javascript
import { render, fireEvent } from "@testing-library/react-native";
import CategoryCard from "../CategoryCard";

describe("CategoryCard", () => {
  const mockCategory = {
    name: "Test Category",
    value: "TEST",
    icon: "test-icon",
    color: "#FF0000",
    description: "Test description",
  };

  test("renders category information", () => {
    const { getByText } = render(
      <CategoryCard
        category={mockCategory}
        productCount={5}
        topBrands={["Brand A", "Brand B"]}
      />
    );

    expect(getByText("Test Category")).toBeTruthy();
    expect(getByText("Brand A • Brand B • 5 products")).toBeTruthy();
  });

  test("calls onPress when tapped", () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <CategoryCard category={mockCategory} onPress={mockOnPress} />
    );

    fireEvent.press(getByRole("button"));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Common Issues

#### Card Not Displaying

**Problem**: Card appears blank or doesn't render  
**Solution**: Ensure category object has required properties (name, value, icon, color)

```javascript
// Required category structure
const category = {
  name: "Category Name", // Required
  value: "CATEGORY_VALUE", // Required
  icon: "icon-name", // Required
  color: "#HEXCOLOR", // Required
};
```

#### Styling Issues

**Problem**: Card doesn't match design expectations  
**Solution**: Check responsive utility imports and screen size calculations

```javascript
import { responsiveWidth, responsiveHeight } from "../../constants/responsive";
```

#### Performance Issues

**Problem**: Sluggish scrolling with many cards  
**Solution**: Ensure proper memoization and list optimization

```javascript
// Wrap in React.memo and use stable onPress functions
const handlePress = useCallback(() => {
  onCategorySelect(category);
}, [category, onCategorySelect]);
```

## Customization

### Adding New Visual Elements

To add new visual elements, extend the component:

```javascript
const CategoryCard = ({
  category,
  productCount,
  topBrands,
  onPress,
  compact,
  style,
  showDiscount = false, // New prop
  discountPercent = 0, // New prop
}) => {
  return (
    <TouchableOpacity style={[styles.card, style]}>
      {/* Existing content */}

      {showDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPercent}% OFF</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

### Custom Color Schemes

Override default coloring:

```javascript
<CategoryCard
  category={{
    ...category,
    color: customColor, // Override category color
  }}
  style={{
    borderColor: customBorderColor,
    borderWidth: 2,
  }}
/>
```

## Dependencies

- `react-native`: Core React Native components
- `@expo/vector-icons`: For Ionicons
- `../../constants/responsive`: Responsive utility functions
- `../../constants/styles`: Global style constants and colors

## Related Components

- `CategoryContent`: Uses CategoryCard in grid layout
- `CategoryQuickPicker`: Uses CategoryCard in horizontal layout
- `MenuContent`: Integrates category display in menu system

## Version History

- **v1.0**: Initial implementation with basic card design
- **v1.1**: Added compact mode for horizontal lists
- **v1.2**: Enhanced accessibility and performance optimization
- **v1.3**: Added dynamic color theming and top brands display
