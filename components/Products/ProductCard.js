// Renamed from ProductItem.js to ProductCard.js
import { useState, useContext, useMemo, useCallback, memo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { formatProductName } from "../../util/formatProductName";
import { Colors } from "../../constants/styles";
import Button from "../UI/Button";
import { CartContext } from "../../store/cart-context";
import SizeSelector from "../UI/SizeSelector";
import { useToast } from "../UI/ToastProvider";
import SaveToListButton from "../UI/SaveToListButton";
import { useI18n } from "../../store/i18n-context";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
  getComponentSizes,
} from "../../constants/responsive";
import { useDeviceOrientation } from "../../hooks/useResponsive";

function ProductCard({ productGroup, onPress }) {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const product = productGroup[selectedIndex];

  // Get current orientation and component sizes with memoization for performance
  const { orientation } = useDeviceOrientation();
  const componentSizes = useMemo(
    () => getComponentSizes(orientation),
    [orientation]
  );

  // Memoize formatted product name to avoid recalculation
  const formattedProductName = useMemo(
    () => formatProductName(product.productName),
    [product.productName]
  );

  // Memoize image source to avoid recreation on every render
  const imageSource = useMemo(() => {
    // Check if product has a valid image URL
    if (
      product.imageUrl &&
      product.imageUrl.trim() !== "" &&
      product.imageUrl !== "placeholder"
    ) {
      return { uri: product.imageUrl };
    }
    // Use placeholder for missing or invalid images
    return require("../../assets/placeholder.png");
  }, [product.imageUrl]);

  const { showToast } = useToast();
  const cartCtx = useContext(CartContext);

  // Memoized callback functions for better performance
  const addToCartHandler = useCallback(() => {
    cartCtx.addToCart(product, 1);
    showToast(
      t("cart.itemAdded", { productName: formattedProductName }),
      "success",
      2000
    );
  }, [cartCtx, product, formattedProductName, showToast, t]);

  const handleCardPress = useCallback(() => {
    onPress(product);
  }, [onPress, product]);

  const handleSizeSelect = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: "#eee" }}
      onPress={handleCardPress}
    >
      <View style={styles.productContainer}>
        {/* Save to List Button - Top Right Corner */}
        <View style={styles.saveButtonContainer}>
          <SaveToListButton
            product={product}
            size="small"
            onPress={(product, isSaved) => {
              // Prevent card press when save button is pressed
              return;
            }}
          />
        </View>

        <Image
          source={imageSource}
          style={styles.imageContainer}
          resizeMode="contain"
          onError={() => {
            // Handle image loading errors gracefully
            console.warn("Failed to load product image:", product.imageUrl);
          }}
        />
        <View style={styles.innerContainer}>
          <Text
            style={styles.productName}
            numberOfLines={3}
            allowFontScaling={false} // Prevent text scaling issues in compact layout
            ellipsizeMode="tail"
          >
            {formattedProductName}
          </Text>
          <SizeSelector
            variants={productGroup}
            initialIndex={selectedIndex}
            onSelect={handleSizeSelect}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Text style={styles.price}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </Text>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={addToCartHandler}
            activeOpacity={0.8}
            accessibilityLabel={t("cart.addToCartAccessibility", {
              productName: formattedProductName,
            })}
            accessibilityRole="button"
            accessibilityHint={t("cart.addToCartHint")}
          >
            <Text style={styles.buttonText} allowFontScaling={false}>
              {t("cart.addToCart")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

// Memoize the component for better performance - prevent unnecessary re-renders
export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: scaleSize(8),
    overflow: "hidden",
    backgroundColor: "#fff",
    ...deviceAdjustments.shadow,
    elevation: 2, // Enhanced Android shadow
    marginBottom: spacing.xs,
  },
  cardPressed: {
    opacity: 0.8,
  },
  productContainer: {
    flex: 1,
    flexDirection: "column",
    padding: spacing.xs * 0.6, // Reduced padding for space efficiency
    alignItems: "center",
    borderRadius: scaleSize(8),
    backgroundColor: "#fff",
  },
  saveButtonContainer: {
    position: "absolute",
    top: spacing.xs * 0.5,
    right: spacing.xs * 0.5,
    zIndex: 10,
  },
  innerContainer: {
    alignItems: "center",
    marginTop: spacing.xs * 0.3,
    flex: 1,
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: scaleVertical(70), // Fixed height to prevent stretching
    borderRadius: scaleSize(6),
    backgroundColor: "#f8f9fa",
    resizeMode: "contain",
  },
  productName: {
    // ...typography.captionSmall, // Compact typography
    fontWeight: "bold",
    fontSize: scaleSize(12),
    marginTop: spacing.xs * 0.5,
    color: Colors.gray900,
    textAlign: "center",
    // lineHeight: typography.captionSmall.fontSize * 1.2,
  },
  price: {
    ...typography.bodyCompact,
    fontSize: scaleSize(13),
    paddingTop: spacing.xs * 0.2,
    paddingBottom: spacing.xs * 0.3,
    fontWeight: "700",
    color: Colors.accent700,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacing.xs * 0.2,
    paddingTop: 0,
  },
  addToCartButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: scaleVertical(4), // Compact button
    paddingHorizontal: spacing.xs * 0.8,
    borderRadius: scaleSize(6),
    alignItems: "center",
    minHeight: scaleVertical(12), // Smaller but still accessible (above 24px minimum)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: "black",
    fontSize: scaleSize(10), // Compact text
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
