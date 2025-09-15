import { useState, useEffect, useContext } from "react";
import { useReturns } from "../store/returns-context";
import { AuthContext } from "../store/auth-context";
import { useToast } from "../components/UI/ToastProvider";

/**
 * Custom hook for return request logic and state management
 */
export function useReturnRequest(order = null) {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const { showToast } = useToast();
  const {
    returnEligibility,
    isLoading,
    error,
    checkOrderReturnEligibility,
    calculateItemsRefund,
    createReturnRequest,
    clearError,
    resetReturnFlow,
    RETURN_REASONS,
    REFUND_METHODS,
  } = useReturns();

  // Local state for return form
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedRefundMethod, setSelectedRefundMethod] = useState(
    REFUND_METHODS.ORIGINAL_PAYMENT
  );
  const [customerNotes, setCustomerNotes] = useState("");
  const [refundCalculation, setRefundCalculation] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Initialize return eligibility check when order is provided
  useEffect(() => {
    if (order?.id && isAuthenticated) {
      checkOrderEligibility();
    }

    return () => {
      resetReturnFlow();
    };
  }, [order?.id, isAuthenticated]);

  // Recalculate refund when selected items change
  useEffect(() => {
    if (selectedItems.length > 0 && order) {
      const calculation = calculateItemsRefund(selectedItems, order);
      setRefundCalculation(calculation);
    } else {
      setRefundCalculation(null);
    }
  }, [selectedItems, order]);

  // Check return eligibility for the order
  async function checkOrderEligibility() {
    if (!order?.id) return;

    try {
      await checkOrderReturnEligibility(order.id);
    } catch (error) {
      showToast("Failed to check return eligibility", "error");
    }
  }

  // Add/remove item from return selection
  function toggleItemSelection(item, quantity = 1) {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex(
        (selected) => selected.itemId === item.id
      );

      if (existingIndex >= 0) {
        // Item already selected, update quantity or remove
        if (quantity <= 0) {
          return prev.filter((selected) => selected.itemId !== item.id);
        } else {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(quantity, item.maxReturnableQuantity),
          };
          return updated;
        }
      } else {
        // Add new item
        return [
          ...prev,
          {
            itemId: item.id,
            productName: item.productName,
            size: item.sizes,
            color: item.colour,
            price: item.price,
            quantity: Math.min(quantity, item.maxReturnableQuantity),
            maxQuantity: item.maxReturnableQuantity,
            reason: returnReason, // Apply current reason to all items
          },
        ];
      }
    });
  }

  // Update quantity for a selected item
  function updateItemQuantity(itemId, quantity) {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.maxQuantity)),
            }
          : item
      )
    );
  }

  // Set return reason for all selected items
  function setReturnReasonForItems(reason) {
    setReturnReason(reason);
    setSelectedItems((prev) => prev.map((item) => ({ ...item, reason })));
  }

  // Validate form before submission
  function validateForm() {
    const errors = {};

    if (selectedItems.length === 0) {
      errors.items = "Please select at least one item to return";
    }

    if (!returnReason) {
      errors.reason = "Please select a reason for return";
    }

    if (returnReason === RETURN_REASONS.OTHER && !customReason.trim()) {
      errors.customReason = "Please provide a custom reason";
    }

    if (!selectedRefundMethod) {
      errors.refundMethod = "Please select a refund method";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Submit return request
  async function submitReturn() {
    if (!validateForm()) {
      showToast("Please fix the form errors", "error");
      return false;
    }

    if (!refundCalculation) {
      showToast("Unable to calculate refund amount", "error");
      return false;
    }

    try {
      const returnData = {
        orderId: order.id,
        userId,
        items: selectedItems,
        reason: returnReason,
        customReason:
          returnReason === RETURN_REASONS.OTHER ? customReason : null,
        refundMethod: selectedRefundMethod,
        refundAmount: refundCalculation.totalRefund,
        refundBreakdown: refundCalculation.breakdown,
        customerNotes: customerNotes.trim() || null,
      };

      const result = await createReturnRequest(returnData);

      showToast("Return request submitted successfully", "success");

      // Reset form
      resetForm();

      return result;
    } catch (error) {
      showToast("Failed to submit return request", "error");
      return false;
    }
  }

  // Reset form to initial state
  function resetForm() {
    setSelectedItems([]);
    setReturnReason("");
    setCustomReason("");
    setSelectedRefundMethod(REFUND_METHODS.ORIGINAL_PAYMENT);
    setCustomerNotes("");
    setRefundCalculation(null);
    setFormErrors({});
  }

  // Calculate BBM Bucks incentive (1% bonus for choosing BBM Bucks)
  function getBBMBucksIncentive(refundAmount) {
    const baseAmount = refundAmount;
    const bonusAmount = Math.round(baseAmount * 0.01); // 1% bonus
    return {
      baseAmount,
      bonusAmount,
      totalAmount: baseAmount + bonusAmount,
    };
  }

  // Get available refund methods based on original payment
  function getAvailableRefundMethods() {
    const methods = [
      {
        id: REFUND_METHODS.ORIGINAL_PAYMENT,
        label: "Original Payment Method",
        description: order?.paymentMethod
          ? `Back to ${order.paymentMethod}`
          : "Back to original method",
        icon: "card-outline",
      },
    ];

    // Always offer BBM Bucks with incentive
    if (refundCalculation?.totalRefund > 0) {
      const incentive = getBBMBucksIncentive(refundCalculation.totalRefund);
      methods.push({
        id: REFUND_METHODS.BBM_BUCKS,
        label: "BBM Bucks (Recommended)",
        description: `₹${incentive.totalAmount.toFixed(2)} (₹${
          incentive.bonusAmount
        } bonus!)`,
        icon: "gift-outline",
        highlighted: true,
      });
    }

    return methods;
  }

  return {
    // State
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

    // Actions
    toggleItemSelection,
    updateItemQuantity,
    setReturnReasonForItems,
    setCustomReason,
    setSelectedRefundMethod,
    setCustomerNotes,
    submitReturn,
    resetForm,
    clearError,

    // Helper functions
    getBBMBucksIncentive,
    getAvailableRefundMethods,

    // Computed properties
    canSubmit:
      selectedItems.length > 0 &&
      returnReason &&
      selectedRefundMethod &&
      !isLoading,
    totalItemsSelected: selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    ),

    // Constants
    RETURN_REASONS,
    REFUND_METHODS,
  };
}
