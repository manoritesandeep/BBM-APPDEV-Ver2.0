import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../constants/responsive";

const PAYMENT_METHODS = {
  COD: "cod",
  RAZORPAY: "razorpay",
};

function PaymentMethodSection({
  selectedPaymentMethod,
  onPaymentMethodSelect,
}) {
  const paymentOptions = [
    {
      id: PAYMENT_METHODS.RAZORPAY,
      title: "Pay Online (Razorpay)",
      subtitle: "Cards, UPI, Net Banking, Wallets",
      icon: "card-outline",
      color: Colors.gray900,
    },
    {
      id: PAYMENT_METHODS.COD,
      title: "Cash on Delivery",
      subtitle: "Pay when you receive",
      icon: "cash-outline",
      color: Colors.accent700,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.card}>
        {paymentOptions.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === option.id &&
                styles.selectedPaymentMethod,
              index > 0 && styles.paymentMethodBorder,
            ]}
            onPress={() => onPaymentMethodSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodLeft}>
                <Ionicons
                  name={option.icon}
                  size={iconSizes.md}
                  color={option.color}
                />
                <View style={styles.paymentTextContainer}>
                  <Text
                    style={[
                      styles.paymentText,
                      selectedPaymentMethod === option.id &&
                        styles.selectedPaymentText,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.paymentSubtext,
                      selectedPaymentMethod === option.id &&
                        styles.selectedPaymentSubtext,
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPaymentMethod === option.id &&
                    styles.radioButtonSelected,
                ]}
              >
                {selectedPaymentMethod === option.id && (
                  <Ionicons
                    name="checkmark"
                    size={scaleSize(14)}
                    color={Colors.black}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default PaymentMethodSection;
export { PAYMENT_METHODS };

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
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  paymentMethod: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paymentMethodBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectedPaymentMethod: {
    backgroundColor: Colors.primary50,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary600,
  },
  paymentMethodContent: {
    ...layout.flexRow,
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodLeft: {
    ...layout.flexRow,
    alignItems: "center",
    flex: 1,
  },
  paymentTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  paymentText: {
    ...typography.body,
    fontWeight: "500",
    color: Colors.gray900,
  },
  selectedPaymentText: {
    color: Colors.primary700,
    fontWeight: "600",
  },
  paymentSubtext: {
    ...typography.caption,
    color: Colors.gray600,
    marginTop: spacing.xs,
  },
  selectedPaymentSubtext: {
    color: Colors.primary600,
  },
  radioButton: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    borderWidth: 2,
    // borderColor: Colors.gray900,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  radioButtonSelected: {
    // borderColor: Colors.gray300,
    backgroundColor: Colors.gray900,
  },
});
