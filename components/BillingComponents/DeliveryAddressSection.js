import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";

function DeliveryAddressSection({
  isAuthenticated,
  selectedAddress,
  defaultAddress,
  onAddressPress,
}) {
  if (!isAuthenticated) return null;

  const currentAddress = selectedAddress || defaultAddress;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <Pressable style={styles.card} onPress={onAddressPress}>
        {currentAddress ? (
          <View style={styles.addressContent}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>{currentAddress?.label}</Text>
              <Text style={styles.changeText}>Change</Text>
            </View>
            <Text style={styles.addressName}>{currentAddress?.name}</Text>
            <Text style={styles.addressText}>
              {`${currentAddress?.line1}${
                currentAddress?.line2 ? ", " + currentAddress.line2 : ""
              }, ${currentAddress?.city}, ${currentAddress?.state} ${
                currentAddress?.zip
              }`}
            </Text>
          </View>
        ) : (
          <View style={styles.addAddressPrompt}>
            <Text style={styles.addAddressText}>+ Add Delivery Address</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default DeliveryAddressSection;

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
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xs,
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
