import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";

const TRACKING_STAGES = [
  {
    key: "placed",
    label: "Order Placed",
    icon: "checkmark-circle",
    description: "We have received your order",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "thumbs-up",
    description: "Your order has been confirmed",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "construct",
    description: "We're preparing your items",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "airplane",
    description: "Your order is on the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "home",
    description: "Order delivered successfully",
  },
];

const CANCELLED_STAGE = {
  key: "cancelled",
  label: "Cancelled",
  icon: "close-circle",
  description: "Order has been cancelled",
};

function OrderTrackingBar({ order }) {
  const currentStatus = order.status?.toLowerCase();

  // Normalize processing to preparing for tracking purposes
  const normalizedStatus =
    currentStatus === "processing" ? "preparing" : currentStatus;

  // Handle cancelled orders separately
  if (normalizedStatus === "cancelled") {
    return (
      <View style={styles.container}>
        <View style={styles.cancelledContainer}>
          <View style={styles.cancelledIconContainer}>
            <Ionicons
              name={CANCELLED_STAGE.icon}
              size={32}
              color={Colors.accent500}
            />
          </View>
          <View style={styles.cancelledTextContainer}>
            <Text style={styles.cancelledTitle}>{CANCELLED_STAGE.label}</Text>
            <Text style={styles.cancelledDescription}>
              {CANCELLED_STAGE.description}
            </Text>
            {order.cancelledAt && (
              <Text style={styles.cancelledDate}>
                Cancelled on{" "}
                {new Date(
                  order.cancelledAt.seconds * 1000
                ).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Find current stage index
  const currentStageIndex = TRACKING_STAGES.findIndex(
    (stage) => stage.key === normalizedStatus
  );

  // If status not found in stages, default to "placed"
  const activeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  return (
    <View style={styles.container}>
      <View style={styles.stagesContainer}>
        {TRACKING_STAGES.map((stage, index) => {
          const isActive = index <= activeStageIndex;
          const isCurrent = index === activeStageIndex;
          const isCompleted = index < activeStageIndex;

          return (
            <View key={stage.key} style={styles.stageWrapper}>
              <View style={styles.stageContainer}>
                {/* Progress line before stage (except first) */}
                {index > 0 && (
                  <View
                    style={[
                      styles.progressLine,
                      styles.progressLineBefore,
                      isActive && styles.progressLineActive,
                    ]}
                  />
                )}

                {/* Stage circle and icon */}
                <View
                  style={[
                    styles.stageCircle,
                    isActive && styles.stageCircleActive,
                    isCurrent && styles.stageCircleCurrent,
                  ]}
                >
                  <Ionicons
                    name={stage.icon}
                    size={20}
                    color={
                      isActive
                        ? isCurrent
                          ? Colors.primary500
                          : Colors.white
                        : Colors.gray500
                    }
                  />
                </View>

                {/* Progress line after stage (except last) */}
                {index < TRACKING_STAGES.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      styles.progressLineAfter,
                      isCompleted && styles.progressLineActive,
                    ]}
                  />
                )}
              </View>

              {/* Stage label and description */}
              <View style={styles.stageTextContainer}>
                <Text
                  style={[
                    styles.stageLabel,
                    isActive && styles.stageLabelActive,
                    isCurrent && styles.stageLabelCurrent,
                  ]}
                >
                  {stage.label}
                </Text>
                {isCurrent && (
                  <Text style={styles.stageDescription}>
                    {stage.description}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Expected delivery date */}
      {order.expectedDeliveryDate && normalizedStatus !== "delivered" && (
        <View style={styles.deliveryContainer}>
          <Ionicons name="time-outline" size={16} color={Colors.primary500} />
          <Text style={styles.deliveryText}>
            Expected delivery:{" "}
            <Text style={styles.deliveryDate}>
              {new Date(
                order.expectedDeliveryDate.seconds * 1000
              ).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Text>
        </View>
      )}

      {/* Order placed date */}
      <View style={styles.orderDateContainer}>
        <Text style={styles.orderDateText}>
          Order placed on{" "}
          {new Date(order.createdAt.seconds * 1000).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
        </Text>
      </View>
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
  stagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  stageContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 40,
    position: "relative",
  },
  stageCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray300,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  stageCircleActive: {
    backgroundColor: Colors.success600,
    borderColor: Colors.success600,
  },
  stageCircleCurrent: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary500,
    borderWidth: 3,
  },
  progressLine: {
    height: 3,
    backgroundColor: Colors.gray300,
    position: "absolute",
    top: "50%",
    marginTop: -1.5,
  },
  progressLineBefore: {
    left: 0,
    right: "50%",
  },
  progressLineAfter: {
    left: "50%",
    right: 0,
  },
  progressLineActive: {
    backgroundColor: Colors.success600,
  },
  stageTextContainer: {
    marginTop: 8,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 16,
  },
  stageLabelActive: {
    color: Colors.success700,
  },
  stageLabelCurrent: {
    color: Colors.primary500,
    fontWeight: "700",
  },
  stageDescription: {
    fontSize: 10,
    color: Colors.gray500,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 12,
  },
  deliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 14,
    color: Colors.gray700,
    marginLeft: 6,
  },
  deliveryDate: {
    fontWeight: "700",
    color: Colors.primary500,
  },
  orderDateContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
    paddingTop: 12,
  },
  orderDateText: {
    fontSize: 12,
    color: Colors.gray600,
    textAlign: "center",
    fontStyle: "italic",
  },
  // Cancelled order styles
  cancelledContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error100,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent500,
  },
  cancelledIconContainer: {
    marginRight: 12,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.accent500,
    marginBottom: 4,
  },
  cancelledDescription: {
    fontSize: 14,
    color: Colors.gray700,
    marginBottom: 4,
  },
  cancelledDate: {
    fontSize: 12,
    color: Colors.gray600,
    fontStyle: "italic",
  },
});

export default OrderTrackingBar;
