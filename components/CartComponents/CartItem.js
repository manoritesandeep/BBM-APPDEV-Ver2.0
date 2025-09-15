import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import QuantitySelector from "./QuantitySelector";
import { formatProductName } from "../../util/formatProductName";
import SaveToListButton from "../UI/SaveToListButton";
import { useContext } from "react";
import { SavedItemsContext } from "../../store/saved-items-context";
import { AuthContext } from "../../store/auth-context";
import { useToast } from "../UI/ToastProvider";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../constants/responsive";

function CartItem({ item, onRemove, onQuantityChange }) {
  const formattedProductName = formatProductName(item.productName);
  const savedItemsCtx = useContext(SavedItemsContext);
  const authCtx = useContext(AuthContext);
  const { showToast } = useToast();

  function handleRemove() {
    Alert.alert("Remove Item", `Remove ${formattedProductName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          onRemove(item.id);
          Alert.alert("Removed", `${formattedProductName} removed from cart.`);
        },
      },
    ]);
  }

  function handleQuantityChange(qty) {
    onQuantityChange(item.id, qty);
  }

  async function handleSaveForLater() {
    if (!authCtx.isAuthenticated) {
      showToast("Please sign in to save items", "warning");
      return;
    }

    try {
      // Convert cart item back to product format for saving
      const productToSave = {
        id: item.id,
        productNum: item.productNum,
        productName: item.productName,
        HSN: item.HSN,
        sizes: item.sizes,
        colour: item.colour,
        subCategory: item.subCategory,
        category: item.category,
        brand: item.brand,
        imageUrl: item.imageUrl,
        rating: item.rating,
        rentable: item.rentable,
        material: item.material,
        price: item.price,
        discount: item.discount || 0,
      };

      // Add to saved items
      await savedItemsCtx.addToSaved(productToSave);

      // Remove from cart
      onRemove(item.id);

      showToast("Moved to saved items", "success");
    } catch (error) {
      console.error("Error saving item:", error);
      if (error.message === "Item is already saved") {
        // If already saved, just remove from cart
        onRemove(item.id);
        showToast("Item already saved, removed from cart", "info");
      } else {
        showToast("Failed to save item", "error");
      }
    }
  }

  const totalItemPrice = (item.price * item.quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              item.imageUrl && item.imageUrl.trim() !== ""
                ? { uri: item.imageUrl }
                : require("../../assets/placeholder.png")
            }
            style={styles.image}
          />
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.topRow}>
            <Text
              style={styles.productName}
              numberOfLines={1}
              allowFontScaling={true}
            >
              {formattedProductName}
            </Text>
            <TouchableOpacity
              onPress={handleRemove}
              style={styles.removeButton}
            >
              <Ionicons
                name="trash-outline"
                size={iconSizes.sm}
                color={Colors.gray500}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.size} allowFontScaling={true}>
            Size: {item.sizes} • ₹{item.price} each
          </Text>

          {/* Save for Later Button */}
          {authCtx.isAuthenticated && (
            <TouchableOpacity
              style={styles.saveForLaterButton}
              onPress={handleSaveForLater}
            >
              <Ionicons
                name="heart-outline"
                size={14}
                color={Colors.accent500}
              />
              <Text style={styles.saveForLaterText}>Save for later</Text>
            </TouchableOpacity>
          )}

          {/* Quantity and Price Row */}
          <View style={styles.bottomRow}>
            <QuantitySelector
              quantity={item.quantity}
              onChange={handleQuantityChange}
            />
            <Text style={styles.totalPrice} allowFontScaling={true}>
              ₹{totalItemPrice}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CartItem;

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
  },
  card: {
    ...layout.flexRow,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.sm,
    alignItems: "center",
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: scaleVertical(80),
  },
  imageContainer: {
    marginRight: spacing.sm,
  },
  image: {
    width: scaleSize(60),
    height: scaleVertical(60),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.gray300,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs / 2,
  },
  productName: {
    flex: 1,
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray900,
    marginRight: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs / 2,
    borderRadius: scaleSize(16),
    backgroundColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    width: scaleSize(28),
    height: scaleSize(28),
  },
  size: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  saveForLaterButton: {
    ...layout.flexRow,
    alignItems: "center",
    marginBottom: spacing.xs,
    alignSelf: "flex-start",
  },
  saveForLaterText: {
    ...typography.caption,
    color: Colors.accent500,
    fontWeight: "500",
    marginLeft: spacing.xs / 2,
  },
  bottomRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPrice: {
    ...typography.body,
    fontWeight: "700",
    color: Colors.accent700,
  },
});
