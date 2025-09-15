import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";

function OrderSummary({ items }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.card}>
        {items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.productName} (Size: {item.sizes})
            </Text>
            <Text style={styles.itemDetails}>
              {item.quantity} × ₹{item.price} = ₹
              {(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default OrderSummary;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.lg,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: spacing.sm,
  },
  itemName: {
    ...typography.body,
    fontWeight: "500",
    color: Colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  itemDetails: {
    ...typography.caption,
    color: Colors.gray600,
  },
});
