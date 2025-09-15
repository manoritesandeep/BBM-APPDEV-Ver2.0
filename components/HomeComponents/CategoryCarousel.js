import { View, Text, FlatList, StyleSheet } from "react-native";

import ProductCard from "./ProductCard";
import { Colors } from "../../constants/styles";
import { useTheme } from "../../store/theme-context";
import {
  typography,
  spacing,
  scaleVertical,
  // getResponsiveSpacing,
  // getDeviceSize,
  // getComponentSizes,
} from "../../constants/responsive";
import { useDeviceOrientation } from "../../hooks/useResponsive";
import { formatProductName } from "../../util/formatProductName";

function CategoryCarousel({ title, products, onProductPress }) {
  if (!products || products.length === 0) return null;

  // Get current orientation and theme
  const { orientation } = useDeviceOrientation();
  const { colors } = useTheme();
  const isLandscape = orientation === "landscape";

  // Dynamic styling based on orientation and theme
  const styles = {
    container: {
      marginBottom: scaleVertical(1),
    },
    title: {
      ...typography.h5,
      color: colors.accent700,
      marginLeft: spacing.sm,
      marginBottom: spacing.xs * 0.5,
    },
    contentContainer: {
      paddingHorizontal: spacing.xs,
    },
  };

  const formattedTitle = formatProductName(title);
  return (
    <View style={styles.container}>
      <Text style={styles.title} allowFontScaling={true}>
        {formattedTitle}
      </Text>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => {
          // Handle both individual products and product groups
          const product = Array.isArray(item) ? item[0] : item;
          return product?.id
            ? product.id.toString()
            : `${formattedTitle}-${index}`;
        }}
        renderItem={({ item }) => (
          <ProductCard productGroup={item} onPress={onProductPress} />
        )}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

export default CategoryCarousel;
