import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, ActivityIndicator } from "react-native";
import { PaymentService } from "../../../../util/paymentService";
import Button from "../../../UI/Button";
import { Colors } from "../../../../constants/styles";
import { spacing, typography } from "../../../../constants/responsive";

function Razorpay({
  amount,
  orderId,
  userInfo,
  onPaymentSuccess,
  onPaymentFailure,
  disabled = false,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Validate props and set initialized state
    if (amount && orderId && userInfo) {
      setIsInitialized(true);
    } else {
      console.error("❌ Razorpay component missing required props:", {
        amount: !!amount,
        orderId: !!orderId,
        userInfo: !!userInfo,
      });
    }
  }, [amount, orderId, userInfo]);

  const handlePayment = async () => {
    if (isProcessing || !isInitialized) {
      console.log("⚠️ Payment already processing or not initialized");
      return;
    }

    console.log("🎯 Starting payment process...");

    // Validate payment data
    const paymentData = {
      amount,
      orderId: orderId || PaymentService.generateOrderId(),
      userInfo,
    };

    const validation = PaymentService.validatePaymentData(paymentData);
    if (!validation.isValid) {
      console.error("❌ Payment validation failed:", validation.errors);
      Alert.alert("Payment Error", validation.errors.join("\n"));
      return;
    }

    setIsProcessing(true);

    try {
      console.log("💳 Calling Razorpay with data:", paymentData);
      const result = await PaymentService.processRazorpayPayment(paymentData);

      console.log("🔄 Payment result:", result);

      if (result.success) {
        console.log("✅ Payment successful:", result.paymentId);
        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentId: result.paymentId,
            orderId: result.orderId,
            signature: result.signature,
            amount: amount,
            paymentMethod: "razorpay",
          });
        }
      } else {
        console.log("❌ Payment failed:", result.error);
        // Handle payment failure
        if (onPaymentFailure) {
          onPaymentFailure(result);
        }

        // Show retry option if not cancelled
        if (!result.cancelled) {
          PaymentService.showPaymentResult(
            result,
            null,
            (failureResult, shouldRetry) => {
              if (shouldRetry) {
                console.log("🔄 Retrying payment...");
                // Retry payment after a brief delay
                setTimeout(() => handlePayment(), 500);
              }
            }
          );
        } else {
          console.log("🚫 Payment cancelled by user");
        }
      }
    } catch (error) {
      console.error("💥 Payment processing error:", error);
      const errorResult = {
        success: false,
        error: "Something went wrong. Please try again.",
        code: "UNKNOWN_ERROR",
      };

      if (onPaymentFailure) {
        onPaymentFailure(errorResult);
      }

      Alert.alert("Error", errorResult.error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if not initialized
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Payment component not properly configured
        </Text>
      </View>
    );
  }

  if (!amount || amount <= 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid payment amount</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.paymentInfo}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountText}>
          {PaymentService.formatAmount(amount)}
        </Text>
      </View>

      <Button
        onPress={handlePayment}
        disabled={disabled || isProcessing}
        style={[
          styles.payButton,
          (disabled || isProcessing) && styles.disabledButton,
        ]}
        mode="filled"
      >
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.white} size="small" />
            <Text style={styles.payButtonText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.payButtonText}>
            Pay {PaymentService.formatAmount(amount)}
          </Text>
        )}
      </Button>
    </View>
  );
}

export default Razorpay;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentInfo: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  amountLabel: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  amountText: {
    ...typography.heading2,
    color: Colors.gray900,
    fontWeight: "700",
  },
  payButton: {
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    ...typography.body,
    color: Colors.error500,
    textAlign: "center",
  },
});
