import { useState, useContext } from "react";
import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { formatProductName } from "../../util/formatProductName";
import { CartContext } from "../../store/cart-context";
import CompactSizeSelector from "../UI/CompactSizeSelector";
import { useToast } from "../UI/ToastProvider";
import { useI18n } from "../../store/i18n-context";
import { useTheme } from "../../store/theme-context";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
  // responsiveWidth,
  // getOrientation,
  getComponentSizes,
} from "../../constants/responsive";
import { useDeviceOrientation } from "../../hooks/useResponsive";

function ProductCard({ productGroup, onPress }) {
  // Handle both individual products and product groups
  const products = Array.isArray(productGroup) ? productGroup : [productGroup];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const product = products[selectedIndex];

  // Get current orientation and component sizes
  const { orientation } = useDeviceOrientation();
  const componentSizes = getComponentSizes(orientation);
  const { t } = useI18n();
  const { colors, isDark } = useTheme();

  // Calculate a compact bottom area height (price/rating + button) and reserve that space
  // so bottom controls can be absolutely anchored — this keeps the Add button at a
  // consistent vertical position across cards regardless of product name length.
  const bottomAreaHeight = Math.max(
    deviceAdjustments.minTouchTarget,
    componentSizes.button.small.minHeight + scaleVertical(28)
  );

  const cartCtx = useContext(CartContext);
  const { showToast } = useToast();
  const formattedProductName = formatProductName(product.productName);

  // Dynamic styles based on orientation and theme
  const styles = {
    card: {
      width: componentSizes.productCard.width,
      minHeight: componentSizes.productCard.minHeight,
      backgroundColor: colors.card,
      borderRadius: 8,
      // Removed marginRight to allow parent container to control spacing
      ...deviceAdjustments.shadow,
      overflow: "hidden",
      ...layout.flexColumn,
      position: "relative",
      paddingBottom: bottomAreaHeight,
    },
    cardContent: {
      padding: spacing.xs,
      alignItems: "center",
      // let the content area grow to fill space above the anchored bottom controls
      flex: 1,
      justifyContent: "flex-start",
    },
    image: {
      width: "100%",
      height: scaleVertical(60),
      borderRadius: scaleSize(4),
      marginBottom: spacing.xs * 0.5,
      backgroundColor: colors.surface,
      resizeMode: "contain",
    },
    placeholderContainer: {
      width: "100%",
      height: scaleVertical(60),
      borderRadius: scaleSize(4),
      marginBottom: spacing.xs * 0.5,
      backgroundColor: colors.primary100,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border || colors.primary200,
      borderStyle: "dashed",
    },
    placeholderIcon: {
      marginBottom: spacing.xs * 0.25,
    },
    placeholderText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: scaleSize(10),
      textAlign: "center",
    },
    name: {
      ...typography.bodyCompact,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.xs * 0.5,
      numberOfLines: 2,
      fontSize: scaleSize(12),
      fontWeight: "bold",
    },
    sizeContainer: {
      width: "100%",
      // tighten the space below the size selector
      marginBottom: spacing.xs * 0.25,
    },
    sizeSelector: {
      marginBottom: spacing.xs * 0.25,
    },
    priceRatingContainer: {
      width: "100%",
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "flex-end",
      // reduced bottom margin to bring price/rating closer to size selector
      marginBottom: spacing.xs * 0.25,
      paddingHorizontal: 0,
    },
    priceContainer: {
      flex: 1,
      alignItems: "flex-start",
    },
    priceLabel: {
      ...typography.captionSmall,
      color: colors.accent700,
      fontWeight: "500",
      marginBottom: 0,
    },
    price: {
      ...typography.bodyCompact,
      color: colors.accent700,
      fontWeight: "bold",
      fontSize: scaleSize(12),
      paddingHorizontal: 6,
    },
    ratingContainer: {
      alignItems: "flex-end",
    },
    rating: {
      ...typography.captionSmall,
      color: Colors.accent500,
      fontWeight: "600",
      fontSize: scaleSize(12),
      paddingHorizontal: 6,
    },
    // Anchor the price/rating + button to the bottom; card has paddingBottom equal
    // to bottomAreaHeight to prevent overlap with content.
    buttonContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      // height: bottomAreaHeight,
      justifyContent: "center",
      // paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs * 0.5,
      backgroundColor: "transparent",
    },
    addToCartButton: {
      backgroundColor: colors.primary500,
      paddingVertical: scaleVertical(6),
      paddingHorizontal: spacing.xs,
      borderRadius: scaleSize(6),
      alignItems: "center",
      // ensure the visible hit target is at least the platform min
      minHeight: deviceAdjustments.minTouchTarget * 0.6,
    },
    buttonText: {
      color: colors.black,
      ...typography.captionSmall,
      fontWeight: "bold",
      fontSize: scaleSize(14),
    },
  };

  const hasValidImage = product.imageUrl && product.imageUrl.trim() !== "";

  function addToCartHandler() {
    cartCtx.addToCart(product, 1);
    showToast(`${formattedProductName} added to cart`, "success");
  }

  function handleCardPress() {
    onPress(productGroup);
  }

  function handleSizeSelect(index) {
    setSelectedIndex(index);
  }

  return (
    <View
      style={[
        styles.card,
        {
          width: 140,
          minHeight: 200,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        {/* Image or Placeholder */}
        {hasValidImage ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            defaultSource={require("../../assets/placeholder.png")}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="image-outline"
              size={32}
              color={colors.textSecondary}
              style={styles.placeholderIcon}
            />
            <Text style={styles.placeholderText} allowFontScaling={true}>
              No Image
            </Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={3} allowFontScaling={true}>
          {formattedProductName}
        </Text>

        {/* Size Selector - only show if there are multiple variants */}
        {products.length > 1 && (
          <View style={styles.sizeContainer}>
            <CompactSizeSelector
              variants={products}
              initialIndex={selectedIndex}
              onSelect={handleSizeSelect}
              style={styles.sizeSelector}
            />
          </View>
        )}

        {/* price and rating moved to bottom container so they stay near the button */}
      </TouchableOpacity>

      {/* Add to Cart Button */}
      <View style={styles.buttonContainer}>
        <View style={styles.priceRatingContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel} allowFontScaling={true}>
              As low as:
            </Text>
            <Text style={styles.price} allowFontScaling={true}>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating} allowFontScaling={true}>
              ⭐ {product.rating}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCartHandler}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText} allowFontScaling={true}>
            {t("cart.addToCart")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ProductCard;
