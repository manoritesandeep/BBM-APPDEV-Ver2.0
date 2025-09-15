import { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import CartList from "./CartList";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import SavedItemsList from "./SavedItemsList";
import { CartContext } from "../../store/cart-context";
import { AuthContext } from "../../store/auth-context";
import { AddressContext } from "../../store/address-context";
import { useI18n } from "../../store/i18n-context";
import LoadingState from "../UI/LoadingState";
import { Colors } from "../../constants/styles";
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";
import { useToast } from "../UI/ToastProvider";
import AddressSelector from "../UI/AddressSelector";
import { useEmailVerificationGuard } from "../../hooks/useEmailVerificationGuard";
import {
  typography,
  spacing,
  layout,
  iconSizes,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";

function CartScreenOutput() {
  const cartCtx = useContext(CartContext);
  const authCtx = useContext(AuthContext);
  const addressCtx = useContext(AddressContext);
  const { t } = useI18n();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { requireVerification } = useEmailVerificationGuard(navigation);

  const [refreshing, setRefreshing] = useState(false);
  const [addressSelectorVisible, setAddressSelectorVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [compactView, setCompactView] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await cartCtx.refreshCart();
    } finally {
      setRefreshing(false);
    }
  };

  if (cartCtx.isCartLoading && !refreshing) {
    return (
      <SafeAreaWrapper>
        <LoadingState type="skeleton-cart" message="Loading your cart..." />
      </SafeAreaWrapper>
    );
  }

  const subtotal = cartCtx.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function handleCheckout() {
    if (cartCtx.items.length === 0) {
      showToast(t("cart.cartIsEmpty"), "warning");
      return;
    }

    // Check email verification before allowing checkout
    const canProceed = requireVerification(
      t("cart.checkoutAndPlaceOrders"),
      () => {
        navigation.navigate("BillingScreen");
      }
    );

    // If verification check failed, don't proceed
    if (!canProceed) {
      return;
    }
  }

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary100}
    >
      <View style={styles.container}>
        {cartCtx.items.length === 0 ? (
          <>
            <EmptyCart onRefresh={handleRefresh} refreshing={refreshing} />
            {/* Show Saved Items even when cart is empty if user has saved items */}
            {authCtx.isAuthenticated && <SavedItemsList />}
          </>
        ) : (
          <>
            {/* Header with view toggle */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>
                  {cartCtx.items.length}{" "}
                  {cartCtx.items.length === 1
                    ? t("cart.item")
                    : t("cart.items")}
                </Text>
                <Text style={styles.headerSubtitle}>
                  ₹{subtotal.toFixed(2)} {t("cart.subtotal").toLowerCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewToggle}
                onPress={() => setCompactView(!compactView)}
              >
                <Ionicons
                  name={compactView ? "apps" : "list"}
                  size={iconSizes.sm}
                  color={Colors.accent700}
                />
                <Text style={styles.toggleText}>
                  {compactView ? t("cart.card") : t("cart.list")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              <CartList
                items={cartCtx.items}
                onRemove={cartCtx.removeFromCart}
                onQuantityChange={cartCtx.updateQuantity}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                compact={compactView}
              />
            </View>

            {/* Saved Items List - Only show for authenticated users */}
            {authCtx.isAuthenticated && <SavedItemsList />}

            {/* Address Selection for Logged-in Users */}
            {/* {authCtx.isAuthenticated && (
              <View style={styles.addressSection}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Pressable
                  style={styles.addressCard}
                  onPress={() => setAddressSelectorVisible(true)}
                >
                  {selectedAddress ||
                  addressCtx.addresses?.find(
                    (a) => a.id === addressCtx.defaultAddressId
                  ) ? (
                    <View style={styles.addressContent}>
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressLabel}>
                          {
                            (
                              selectedAddress ||
                              addressCtx.addresses?.find(
                                (a) => a.id === addressCtx.defaultAddressId
                              )
                            )?.label
                          }
                        </Text>
                        <Text style={styles.changeText}>Change</Text>
                      </View>
                      <Text style={styles.addressName}>
                        {
                          (
                            selectedAddress ||
                            addressCtx.addresses?.find(
                              (a) => a.id === addressCtx.defaultAddressId
                            )
                          )?.name
                        }
                      </Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {(() => {
                          const addr =
                            selectedAddress ||
                            addressCtx.addresses?.find(
                              (a) => a.id === addressCtx.defaultAddressId
                            );
                          return `${addr?.line1}${
                            addr?.line2 ? ", " + addr.line2 : ""
                          }, ${addr?.city}, ${addr?.state} ${addr?.zip}`;
                        })()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.addAddressPrompt}>
                      <Text style={styles.addAddressText}>
                        + Add Delivery Address
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )} */}

            <CartSummary subtotal={subtotal} onCheckout={handleCheckout} />
          </>
        )}

        <AddressSelector
          visible={addressSelectorVisible}
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
          onClose={() => setAddressSelectorVisible(false)}
        />
      </View>
    </SafeAreaWrapper>
  );
}

export default CartScreenOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  header: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs / 4,
  },
  headerSubtitle: {
    ...typography.caption,
    color: Colors.gray600,
    fontWeight: "500",
  },
  viewToggle: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.primary50,
    borderRadius: scaleSize(20),
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  toggleText: {
    ...typography.caption,
    color: Colors.accent700,
    marginLeft: spacing.xs,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  addressSection: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.primary100,
  },
  sectionTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...layout.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: Colors.accent700,
    textTransform: "uppercase",
  },
  changeText: {
    ...typography.bodySmall,
    color: Colors.accent500,
    fontWeight: "500",
  },
  addressName: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  addressText: {
    ...typography.bodySmall,
    color: Colors.gray600,
    lineHeight: 18,
  },
  addAddressPrompt: {
    alignItems: "center",
    padding: spacing.md,
  },
  addAddressText: {
    ...typography.body,
    color: Colors.accent700,
    fontWeight: "500",
  },
});
