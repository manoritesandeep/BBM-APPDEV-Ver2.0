import { useState, useEffect } from "react";
import { updateOrderStatusWithTracking } from "../util/ordersApi";
import {
  getNextOrderStatus,
  canCancelOrder,
  getOrderProgress,
} from "../util/orderTrackingUtils";
import { useToast } from "../components/UI/ToastProvider";

export function useOrderStatusTracking(order) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (order?.status) {
      setProgress(getOrderProgress(order.status));
    }
  }, [order?.status]);

  const updateStatus = async (newStatus, customMessage = null) => {
    if (!order?.id) {
      showToast("Order not found", "error");
      return false;
    }

    setIsUpdating(true);
    try {
      const result = await updateOrderStatusWithTracking(
        order.id,
        newStatus,
        customMessage
      );

      if (result.success) {
        showToast(`Order status updated to ${newStatus}`, "success");
        return true;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status", "error");
    } finally {
      setIsUpdating(false);
    }
    return false;
  };

  const advanceStatus = async (customMessage = null) => {
    if (!order?.status) return false;

    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) {
      showToast("Order is already at final status", "info");
      return false;
    }

    return await updateStatus(nextStatus, customMessage);
  };

  const cancelOrder = async (reason = "Cancelled by customer") => {
    if (!canCancelOrder(order?.status)) {
      showToast("This order cannot be cancelled", "warning");
      return false;
    }

    return await updateStatus("cancelled", reason);
  };

  const getTrackingHistory = () => {
    return order?.trackingHistory || [];
  };

  const getEstimatedDelivery = () => {
    if (!order?.expectedDeliveryDate) return null;

    if (order.expectedDeliveryDate.seconds) {
      return new Date(order.expectedDeliveryDate.seconds * 1000);
    }

    return new Date(order.expectedDeliveryDate);
  };

  const canCancel = canCancelOrder(order?.status);
  const nextStatus = getNextOrderStatus(order?.status);
  const isDelivered = order?.status === "delivered";
  const isCancelled = order?.status === "cancelled";

  return {
    // State
    isUpdating,
    progress,
    canCancel,
    nextStatus,
    isDelivered,
    isCancelled,

    // Actions
    updateStatus,
    advanceStatus,
    cancelOrder,

    // Data getters
    getTrackingHistory,
    getEstimatedDelivery,
  };
}
