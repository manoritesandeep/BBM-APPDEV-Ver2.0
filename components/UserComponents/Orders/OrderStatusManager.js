import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { useOrderStatusTracking } from "../../../hooks/useOrderStatusTracking";
import Button from "../../UI/Button";
import OutlinedButton from "../../UI/OutlinedButton";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "../../../util/orderTrackingUtils";

function OrderStatusManager({ order, onStatusUpdated }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {
    isUpdating,
    canCancel,
    nextStatus,
    isDelivered,
    isCancelled,
    updateStatus,
    advanceStatus,
    cancelOrder,
    getTrackingHistory,
  } = useOrderStatusTracking(order);

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;

    const success = await advanceStatus();
    if (success && onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const success = await cancelOrder();
            if (success && onStatusUpdated) {
              onStatusUpdated();
            }
          },
        },
      ]
    );
  };

  const handleDirectStatusUpdate = async (status) => {
    Alert.alert(
      "Update Status",
      `Update order status to "${ORDER_STATUS_LABELS[status]}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            const success = await updateStatus(status);
            if (success && onStatusUpdated) {
              onStatusUpdated();
            }
          },
        },
      ]
    );
  };

  const trackingHistory = getTrackingHistory();

  if (isCancelled || isDelivered) {
    return (
      <View style={styles.container}>
        <View style={styles.finalStatusContainer}>
          <Ionicons
            name={isCancelled ? "close-circle" : "checkmark-circle"}
            size={24}
            color={isCancelled ? Colors.accent500 : Colors.success600}
          />
          <Text style={styles.finalStatusText}>
            Order {isCancelled ? "Cancelled" : "Delivered"}
          </Text>
        </View>

        {trackingHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Order History</Text>
            {trackingHistory.map((update, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyStatus}>
                  {ORDER_STATUS_LABELS[update.status]}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(update.timestamp).toLocaleString()}
                </Text>
                {update.message && (
                  <Text style={styles.historyMessage}>{update.message}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Status Management</Text>
        <Pressable
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? "Simple" : "Advanced"}
          </Text>
          <Ionicons
            name={showAdvanced ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.primary500}
          />
        </Pressable>
      </View>

      {/* Simple Mode - Next Status */}
      {!showAdvanced && (
        <View style={styles.simpleControls}>
          <Text style={styles.currentStatusText}>
            Current Status:{" "}
            <Text style={styles.currentStatus}>
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
          </Text>

          {nextStatus && (
            <Button
              onPress={handleAdvanceStatus}
              disabled={isUpdating}
              style={styles.nextStatusButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                <Text style={styles.buttonText}>
                  Advance to {ORDER_STATUS_LABELS[nextStatus]}
                </Text>
              </View>
            </Button>
          )}

          {canCancel && (
            <OutlinedButton
              icon="close-circle"
              onPress={handleCancelOrder}
              disabled={isUpdating}
              style={styles.cancelButton}
            >
              Cancel Order
            </OutlinedButton>
          )}
        </View>
      )}

      {/* Advanced Mode - All Status Options */}
      {showAdvanced && (
        <View style={styles.advancedControls}>
          <Text style={styles.sectionTitle}>Update to any status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statusButtons}>
              {Object.entries(ORDER_STATUSES)
                .filter(
                  ([key, status]) =>
                    status !== "cancelled" && status !== order.status
                )
                .map(([key, status]) => (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusButton,
                      isUpdating && styles.statusButtonDisabled,
                    ]}
                    onPress={() => handleDirectStatusUpdate(status)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.statusButtonText}>
                      {ORDER_STATUS_LABELS[status]}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </ScrollView>

          {canCancel && (
            <OutlinedButton
              icon="close-circle"
              onPress={handleCancelOrder}
              disabled={isUpdating}
              style={styles.cancelButton}
            >
              Cancel Order
            </OutlinedButton>
          )}
        </View>
      )}

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Order History</Text>
          {trackingHistory.slice(-3).map((update, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyStatus}>
                {ORDER_STATUS_LABELS[update.status]}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(update.timestamp).toLocaleString()}
              </Text>
              {update.message && (
                <Text style={styles.historyMessage}>{update.message}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray900,
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.primary50,
  },
  advancedToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
    marginRight: 4,
  },
  simpleControls: {
    gap: 12,
  },
  currentStatusText: {
    fontSize: 14,
    color: Colors.gray700,
    textAlign: "center",
  },
  currentStatus: {
    fontWeight: "700",
    color: Colors.primary500,
  },
  nextStatusButton: {
    backgroundColor: Colors.success600,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    borderColor: Colors.accent500,
  },
  advancedControls: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray800,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    backgroundColor: Colors.primary100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
  },
  historyContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray800,
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary300,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary600,
  },
  historyDate: {
    fontSize: 10,
    color: Colors.gray600,
    marginTop: 2,
  },
  historyMessage: {
    fontSize: 11,
    color: Colors.gray700,
    marginTop: 2,
    fontStyle: "italic",
  },
  finalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  finalStatusText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    color: Colors.gray800,
  },
});

export default OrderStatusManager;
