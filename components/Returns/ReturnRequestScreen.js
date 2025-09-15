import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";
import { useReturnRequest } from "../../hooks/useReturnRequest";
import Button from "../UI/Button";
import OutlinedButton from "../UI/OutlinedButton";
import LoadingOverlay from "../UI/LoadingOverlay";
import SafeAreaWrapper from "../UI/SafeAreaWrapper";

function ReturnRequestScreen({ route, navigation }) {
  const { order } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    returnEligibility,
    selectedItems,
    returnReason,
    customReason,
    selectedRefundMethod,
    customerNotes,
    refundCalculation,
    isLoading,
    error,
    formErrors,
    toggleItemSelection,
    updateItemQuantity,
    setReturnReasonForItems,
    setCustomReason,
    setSelectedRefundMethod,
    setCustomerNotes,
    submitReturn,
    clearError,
    getBBMBucksIncentive,
    getAvailableRefundMethods,
    canSubmit,
    totalItemsSelected,
    RETURN_REASONS,
    REFUND_METHODS,
  } = useReturnRequest(order);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      "Submit Return Request",
      `Are you sure you want to return ${totalItemsSelected} item(s) for ₹${refundCalculation?.totalRefund.toFixed(
        2
      )}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            const result = await submitReturn();
            if (result) {
              navigation.navigate("ReturnSuccessScreen", {
                returnNumber: result.returnNumber,
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading && !returnEligibility) {
    return <LoadingOverlay message="Checking return eligibility..." />;
  }

  if (!returnEligibility?.eligible) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <View style={styles.notEligibleContainer}>
            <Ionicons
              name="information-circle"
              size={64}
              color={Colors.orange400}
            />
            <Text style={styles.notEligibleTitle}>Return Not Available</Text>
            <Text style={styles.notEligibleMessage}>
              {returnEligibility?.reason ||
                "This order is not eligible for returns."}
            </Text>
            <OutlinedButton onPress={() => navigation.goBack()}>
              Go Back
            </OutlinedButton>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </Pressable>
          <Text style={styles.headerTitle}>Return Request</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / totalSteps) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && (
            <ItemSelectionStep
              order={order}
              eligibleItems={returnEligibility.eligibleItems}
              selectedItems={selectedItems}
              onToggleItem={toggleItemSelection}
              onUpdateQuantity={updateItemQuantity}
              error={formErrors.items}
            />
          )}

          {currentStep === 2 && (
            <ReasonSelectionStep
              returnReason={returnReason}
              customReason={customReason}
              onReasonChange={setReturnReasonForItems}
              onCustomReasonChange={setCustomReason}
              reasonError={formErrors.reason}
              customReasonError={formErrors.customReason}
            />
          )}

          {currentStep === 3 && (
            <RefundMethodStep
              selectedMethod={selectedRefundMethod}
              onMethodChange={setSelectedRefundMethod}
              availableMethods={getAvailableRefundMethods()}
              refundCalculation={refundCalculation}
              getBBMBucksIncentive={getBBMBucksIncentive}
              error={formErrors.refundMethod}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              order={order}
              selectedItems={selectedItems}
              returnReason={returnReason}
              customReason={customReason}
              selectedRefundMethod={selectedRefundMethod}
              customerNotes={customerNotes}
              onNotesChange={setCustomerNotes}
              refundCalculation={refundCalculation}
              getAvailableRefundMethods={getAvailableRefundMethods}
              getBBMBucksIncentive={getBBMBucksIncentive}
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 1 && (
            <OutlinedButton
              onPress={handlePrevious}
              style={styles.footerButton}
            >
              Previous
            </OutlinedButton>
          )}

          {currentStep < totalSteps ? (
            <Button
              onPress={handleNext}
              style={[
                styles.footerButton,
                { flex: currentStep === 1 ? 1 : 0.6 },
              ]}
              disabled={
                (currentStep === 1 && selectedItems.length === 0) ||
                (currentStep === 2 && !returnReason)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              style={[styles.footerButton, styles.submitButton]}
              disabled={!canSubmit}
            >
              Submit Return Request
            </Button>
          )}
        </View>

        {isLoading && <LoadingOverlay message="Submitting return request..." />}
      </View>
    </SafeAreaWrapper>
  );
}

// Step Components will be imported from separate files
import ItemSelectionStep from "./Steps/ItemSelectionStep";
import ReasonSelectionStep from "./Steps/ReasonSelectionStep";
import RefundMethodStep from "./Steps/RefundMethodStep";
import ReviewStep from "./Steps/ReviewStep";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.heading3,
    color: Colors.gray900,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary500,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: Colors.gray600,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
  },
  footerButton: {
    flex: 0.5,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.success600,
  },
  notEligibleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  notEligibleTitle: {
    ...typography.heading2,
    color: Colors.gray900,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  notEligibleMessage: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

export default ReturnRequestScreen;
