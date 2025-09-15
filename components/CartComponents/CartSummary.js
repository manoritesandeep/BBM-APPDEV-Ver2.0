import { View, Text, StyleSheet } from "react-native";
import Button from "../UI/Button";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";

function CartSummary({ subtotal, onCheckout }) {
  // const tax = +(subtotal * 0.18).toFixed(2);
  // const shipping = 50;
  // const total = +(subtotal + tax + shipping).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.totalSection}>
        <Text style={styles.subTotalLabel} allowFontScaling={true}>
          Subtotal
        </Text>
        <Text style={styles.subTotalAmount} allowFontScaling={true}>
          ₹{subtotal.toFixed(2)}
        </Text>
        <Text style={styles.totalHint} allowFontScaling={true}>
          +taxes & shipping
        </Text>
      </View>
      <View style={styles.checkoutSection}>
        <Button
          onPress={onCheckout}
          mode="filled"
          style={styles.checkoutButton}
          textStyle={styles.checkoutButtonText}
        >
          Checkout
        </Button>
      </View>
    </View>
  );
}

export default CartSummary;

const styles = StyleSheet.create({
  container: {
    ...layout.flexRow,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  totalSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  subTotalLabel: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs / 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subTotalAmount: {
    ...typography.heading,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: spacing.xs / 4,
  },
  totalHint: {
    ...typography.captionSmall,
    color: Colors.gray500,
    fontStyle: "italic",
  },
  checkoutSection: {
    alignItems: "flex-end",
  },
  checkoutButton: {
    minWidth: scaleSize(120),
    maxWidth: scaleSize(140),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: scaleSize(25),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.accent500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonText: {
    color: Colors.gray900,
    fontWeight: "600",
  },
});
