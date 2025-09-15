import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { formatProductName } from "../../util/formatProductName";
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

function CompactCartItem({ item, onRemove, onQuantityChange }) {
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
        },
      },
    ]);
  }

  function handleQuantityChange(delta) {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      onQuantityChange(item.id, newQuantity);
    }
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
        <Image
          source={
            item.imageUrl && item.imageUrl.trim() !== ""
              ? { uri: item.imageUrl }
              : require("../../assets/placeholder.png")
          }
          style={styles.image}
        />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text
                style={styles.productName}
                numberOfLines={1}
                allowFontScaling={true}
              >
                {formattedProductName}
              </Text>
              <Text style={styles.productInfo} allowFontScaling={true}>
                Size: {item.sizes} • ₹{item.price}/each
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRemove}
              style={styles.removeButton}
            >
              <Ionicons
                name="close"
                size={iconSizes.sm}
                color={Colors.gray500}
              />
            </TouchableOpacity>
          </View>

          {/* Save for Later Button */}
          {authCtx.isAuthenticated && (
            <TouchableOpacity
              style={styles.saveForLaterButton}
              onPress={handleSaveForLater}
            >
              <Ionicons
                name="heart-outline"
                size={12}
                color={Colors.accent500}
              />
              <Text style={styles.saveForLaterText}>Save for later</Text>
            </TouchableOpacity>
          )}

          {/* Quantity and Price Row */}
          <View style={styles.bottomRow}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.quantity <= 1 && styles.buttonDisabled,
                ]}
                onPress={() => handleQuantityChange(-1)}
                disabled={item.quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={iconSizes.xs}
                  color={item.quantity <= 1 ? Colors.gray400 : Colors.white}
                />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Ionicons name="add" size={iconSizes.xs} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.totalPrice} allowFontScaling={true}>
              ₹{totalItemPrice}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CompactCartItem;

const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
    paddingHorizontal: spacing.sm,
  },
  card: {
    ...layout.flexRow,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: scaleVertical(70),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  image: {
    width: scaleSize(50),
    height: scaleVertical(50),
    borderRadius: scaleSize(8),
    backgroundColor: Colors.gray300,
    resizeMode: "cover",
    marginRight: spacing.sm,
  },
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  nameContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productName: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 2,
  },
  productInfo: {
    ...typography.captionSmall,
    color: Colors.gray600,
  },
  removeButton: {
    padding: 4,
    borderRadius: scaleSize(12),
    backgroundColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    width: scaleSize(24),
    height: scaleSize(24),
  },
  bottomRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.primary50,
    borderRadius: scaleSize(16),
    paddingHorizontal: spacing.xs / 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quantityButton: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    backgroundColor: Colors.accent500,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.gray300,
  },
  quantity: {
    ...typography.caption,
    fontWeight: "600",
    color: Colors.gray900,
    marginHorizontal: spacing.sm,
    minWidth: scaleSize(20),
    textAlign: "center",
  },
  saveForLaterButton: {
    ...layout.flexRow,
    alignItems: "center",
    marginBottom: spacing.xs,
    alignSelf: "flex-start",
  },
  saveForLaterText: {
    ...typography.captionSmall,
    color: Colors.accent500,
    fontWeight: "500",
    marginLeft: spacing.xs / 2,
  },
  totalPrice: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: Colors.accent700,
  },
});
