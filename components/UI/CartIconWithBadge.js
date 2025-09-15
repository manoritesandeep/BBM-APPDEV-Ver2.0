import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../store/cart-context";
import { Colors } from "../../constants/styles";
import {
  typography,
  scaleSize,
  scaleVertical,
} from "../../constants/responsive";

function CartIconWithBadge({ color, size }) {
  const { items } = useContext(CartContext);

  // Calculate total items in cart
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.container}>
      <Ionicons name="cart" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText} allowFontScaling={true}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: scaleVertical(-4), // Reduced from -6
    right: scaleSize(-4), // Reduced from -6
    backgroundColor: Colors.accent500,
    borderRadius: scaleSize(8), // Reduced from 10
    minWidth: scaleSize(14), // Reduced from 20
    height: scaleVertical(14), // Reduced from 20
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scaleSize(2), // Reduced from 4
    borderWidth: 1, // Reduced from 2
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Math.max(scaleSize(9), 8), // Smaller, more compact font
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: scaleVertical(12), // Tighter line height
  },
});

export default CartIconWithBadge;
